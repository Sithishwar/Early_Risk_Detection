# TODO: Upgrade Crowd Risk Detection System to Production-Ready

## Current Status
- Backend Node.js dependencies installed and ready
- Python ML service updated to use YOLOv8 for object detection
- Video upload endpoint added to Python service
- Frontend has video upload component in Dashboard
- MongoDB connection setup exists
- Socket.IO is set up

## Phase 1: Configuration & YOLO Enhancements

### 1.1 Make YOLO Model Path Configurable
- [ ] Add YOLO_MODEL_PATH environment variable to Python config
- [ ] Update detector.py to use configurable model path
- [ ] Add FRAME_SAMPLING_RATE env variable for video processing

### 1.2 Update Video Processor for Configurable FPS
- [ ] Create app/pipeline/video_processor.py with configurable frame sampling
- [ ] Update detect.py to use video_processor.py

## Phase 2: MongoDB Integration

### 2.1 Convert Models to Mongoose
- [ ] Create models/Zone.js with Mongoose schema
- [ ] Create models/Risk.js with Mongoose schema  
- [ ] Create models/Alert.js with Mongoose schema
- [ ] Add MongoDB connection with proper error handling

### 2.2 Update Services to Use MongoDB
- [ ] Update zone routes to use Mongoose models
- [ ] Update risk routes to store historical data
- [ ] Update alert routes to persist alerts

## Phase 3: Analytics Dashboard (Frontend)

### 3.1 Install Charting Library
- [ ] Install recharts: npm install recharts

### 3.2 Create Chart Components
- [ ] Create components/charts/RiskTrendChart.jsx
- [ ] Create components/charts/DensityBarChart.jsx
- [ ] Create components/KpiCard.jsx
- [ ] Create components/AlertsTable.jsx

### 3.3 Update Dashboard
- [ ] Integrate charts into Dashboard.jsx
- [ ] Add KPI cards with real data
- [ ] Add risk trend chart
- [ ] Add zone density bar chart
- [ ] Update alerts table

## Phase 4: System Status Monitoring

### 4.1 Backend Health Endpoints
- [ ] Add /health/ml endpoint to check ML service
- [ ] Add /health/database endpoint to check MongoDB
- [ ] Add heartbeat mechanism

### 4.2 Frontend Status Indicators
- [ ] Create components/SystemStatus.jsx
- [ ] Add connection status for ML service
- [ ] Add connection status for backend
- [ ] Add visual indicators (green/red dots)

## Phase 5: Documentation

### 5.1 Architecture Documentation
- [ ] Create system architecture diagram (ASCII)
- [ ] Document data flow
- [ ] Document microservices architecture
- [ ] Document real-time risk scoring

### 5.2 API Documentation
- [ ] Document all API endpoints
- [ ] Add request/response examples

## Implementation Order

1. First: Update config files (env.js, main.py)
2. Second: Create Mongoose models
3. Third: Update routes to use MongoDB
4. Fourth: Create frontend chart components
5. Fifth: Update Dashboard with charts
6. Sixth: Add system status monitoring
7. Seventh: Add documentation

## Notes
- Keep clean architecture: API → Controller → Service → Model → Socket
- Don't mix ML inside Node
- Don't put DB calls inside routes
- Don't load models per request
- Don't hardcode paths
