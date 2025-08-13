# Flow API Testing Guide

## API Endpoints

### 1. Save Flow - POST `/api/flows`

Save a flow configuration to the system.

```bash
curl -X POST http://localhost:3000/api/flows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Flow",
    "isActive": true,
    "nodes": [
      {
        "id": "1",
        "type": "service",
        "position": {"x": 100, "y": 100},
        "data": {
          "label": "API Service",
          "type": "API Service"
        }
      },
      {
        "id": "2", 
        "type": "flowchart",
        "position": {"x": 300, "y": 100},
        "data": {
          "label": "Process Data",
          "shape": "rectangle"
        }
      }
    ],
    "edges": [
      {
        "id": "e1-2",
        "source": "1",
        "target": "2"
      }
    ]
  }'
```

### 2. Get All Flows - GET `/api/flows`

Retrieve all saved flows.

```bash
curl -X GET http://localhost:3000/api/flows
```

### 3. Execute Flow - POST `/api/flows/execute`

Execute a flow and get results.

```bash
curl -X POST http://localhost:3000/api/flows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "flowId": "test-flow-001",
    "name": "Test Execution Flow",
    "nodes": [
      {
        "id": "start",
        "type": "service",
        "data": {
          "label": "API Service",
          "type": "API Service"
        }
      },
      {
        "id": "process",
        "type": "service", 
        "data": {
          "label": "Data Processing",
          "type": "Processing Service"
        }
      },
      {
        "id": "notify",
        "type": "service",
        "data": {
          "label": "Send Notification", 
          "type": "Notification Service"
        }
      }
    ],
    "edges": [
      {
        "id": "e1",
        "source": "start",
        "target": "process"
      },
      {
        "id": "e2", 
        "source": "process",
        "target": "notify"
      }
    ]
  }'
```

### 4. Complex Flow Example with Decision Logic

```bash
curl -X POST http://localhost:3000/api/flows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "flowId": "complex-flow-001",
    "name": "Complex Decision Flow",
    "nodes": [
      {
        "id": "start",
        "type": "service",
        "data": {
          "label": "Fetch User Data",
          "type": "Database Service"
        }
      },
      {
        "id": "decision",
        "type": "flowchart",
        "data": {
          "label": "Is Premium User?",
          "shape": "diamond"
        }
      },
      {
        "id": "premium-service",
        "type": "service",
        "data": {
          "label": "Premium API",
          "type": "API Service"
        }
      },
      {
        "id": "standard-service", 
        "type": "service",
        "data": {
          "label": "Standard Processing",
          "type": "Processing Service"
        }
      }
    ],
    "edges": [
      {
        "id": "e1",
        "source": "start",
        "target": "decision"
      },
      {
        "id": "e2-premium",
        "source": "decision", 
        "target": "premium-service"
      },
      {
        "id": "e3-standard",
        "source": "decision",
        "target": "standard-service"
      }
    ]
  }'
```

## Expected Responses

### Save Flow Response
```json
{
  "success": true,
  "flow": {
    "id": "1692123456789",
    "name": "Sample Flow",
    "isActive": true,
    "nodes": [...],
    "edges": [...],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Flow saved successfully"
}
```

### Execute Flow Response
```json
{
  "success": true,
  "execution": {
    "flowId": "test-flow-001",
    "name": "Test Execution Flow",
    "status": "completed",
    "executedAt": "2024-01-15T10:35:00.000Z",
    "results": [
      {
        "nodeId": "start",
        "nodeName": "API Service",
        "nodeType": "service",
        "serviceType": "API Service",
        "executedAt": "2024-01-15T10:35:01.000Z",
        "status": "success",
        "message": "API call executed",
        "output": {
          "endpoint": "/api/example",
          "method": "GET",
          "status": 200,
          "data": {"message": "API response"}
        }
      }
    ],
    "log": [
      "Executed node: API Service (start)",
      "Executed node: Data Processing (process)",
      "Executed node: Send Notification (notify)"
    ],
    "summary": {
      "totalNodes": 3,
      "executedNodes": 3,
      "startingNodes": 1
    }
  },
  "message": "Flow executed successfully"
}
```

## Testing from Service Flow Designer

1. **Open Service Flow Designer Modal** in the application
2. **Add some nodes** (Service nodes and/or Flowchart shapes)  
3. **Connect them with edges**
4. **Set a Flow Name** (edit the title at the top)
5. **Toggle "Active Flow" to ON** (the toggle switch in header)
6. **Click "Save Flow"** to save to database
7. **Click "Test Flow"** to execute via API

The Test Flow button will only be enabled when "Active Flow" is toggled ON.

## Postman Collection

You can import these requests into Postman for easier testing:

1. Create a new collection called "Flow API"
2. Add the above curl commands as separate requests
3. Set base URL to `http://localhost:3000`
4. Test each endpoint individually

## Development Notes

- The API uses in-memory storage for demo purposes
- In production, replace with proper database storage
- Add authentication and authorization as needed
- Implement proper error handling and validation
- Add rate limiting for API protection
- Consider adding webhooks for flow completion notifications