# Crowd Risk Detection System

Video in &rarr; YOLO person detection + ByteTrack tracking &rarr; grid zone
mapping &rarr; density + movement (matched by track id) &rarr; LSTM density
forecast &rarr; weighted risk score &rarr; alerts &rarr; live dashboard.

Three services:

```
backend/python-ml-service   FastAPI. OpenCV + YOLO (ultralytics) + ByteTrack + LSTM forecast.
backend/node-risk-engine    Express + Socket.IO. Zones, risk scoring, alerts, REST API.
frontend                    React + Vite dashboard (heatmap, alerts, zone detail).
```

## 1. Python ML service (port 8000)

```bash
cd backend/python-ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

First run downloads `yolo11n.pt` automatically (needs internet). To use a
model you already have, set `YOLO_MODEL_PATH=/path/to/model.pt`.

The LSTM forecaster needs a trained model at `app/models/crowd_lstm.h5`.
If you don't have one yet, train a quick one from dummy data to get started:

```bash
python -m app.forecasting.train
```

(Swap in real historical density data later for a meaningful forecast —
the dummy version just makes the endpoint work.)

Check it's up: `curl localhost:8000/health`

## 2. Node risk engine (port 5000)

```bash
cd backend/node-risk-engine
npm install
cp .env.example .env   # defaults already point at the ML service on :8000
npm run dev
```

Check it's up: `curl localhost:5000/health` and `curl localhost:5000/health/ml`
(the second one confirms the Node service can reach the Python service).

Run the test suite (unit tests for the id-matched speed logic, plus an
end-to-end test of the whole video&rarr;zones&rarr;risk&rarr;alerts&rarr;socket
pipeline against a mocked ML service):

```bash
npm test
```

## 3. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL. If your backend isn't on
`localhost:5000`, set `VITE_BACKEND_URL` (e.g. in a `.env` file in `frontend/`).

## Using it

1. Open the dashboard. The navbar shows whether the API and ML service are
   reachable.
2. Under **Full pipeline: grid risk analysis**, upload a video with people in
   it. This is the main flow: detection + tracking, a 5x5 zone grid, density,
   movement, forecast, and risk score per zone, plus any alerts fired.
3. The heatmap and zone cards update live over Socket.IO as soon as analysis
   finishes. Click any zone to see its trend and per-frame timeline.
4. The **Alerts** page lists every zone that crossed the critical risk
   threshold (default 0.75, set via `CRITICAL_RISK_THRESHOLD` in the Node
   `.env`).

## Key API endpoints (Node, port 5000)

| Method | Path                      | Purpose                                            |
|--------|---------------------------|-----------------------------------------------------|
| POST   | `/api/video/analyze`      | Full pipeline: video &rarr; all zones' risk + alerts |
| GET    | `/api/zones`              | Current state of every zone (for the heatmap)       |
| GET    | `/api/zones/:zoneId`      | One zone's detail: timeline + risk history          |
| DELETE | `/api/zones`              | Reset all zone state                                |
| POST   | `/api/zones/:zoneId/video`| Quick single-zone upload (legacy, simple heuristic) |
| GET    | `/api/alerts`             | Recent critical alerts                              |
| DELETE | `/api/alerts`             | Clear alert log                                     |
| GET    | `/health`, `/health/ml`   | Liveness / ML reachability                          |

## What changed from the original scaffold

- **`app/vision/detector.py`** was a broken duplicate of the API router
  (importing from itself) — YOLO detection was never actually implemented.
  It's now a real module using `ultralytics` YOLO + ByteTrack
  (`model.track(tracker="bytetrack.yaml", classes=[0], persist=True)`).
- **Movement speed** used to match people between frames by array index,
  which silently breaks the moment detection order changes. It's now
  matched by ByteTrack's persistent track id, with a full per-frame,
  multi-sample speed calculation instead of just comparing two snapshots.
- **The frontend's CSS was never imported**, so none of the dashboard's
  card/table/pill styling was ever applied — this was the main cause of
  the "messy" look. Fixed, plus a complete dark dashboard theme.
- **`useLiveRisk`** (the hook the dashboard depends on) didn't return
  `zoneHistory`, `topZone`, or `totalPeople`, which `Dashboard.jsx` was
  already trying to use — this crashed/broke the page. Fixed.
- **Alerts and Zone Details pages** were placeholder stubs. Both are now
  fully implemented, backed by real Node endpoints (`Alert` model, alert
  store, zone-detail endpoint) that didn't exist before.
- Removed the dead fake-login flow (`isAuthenticated = true` stub) — the
  app now goes straight to the dashboard.
