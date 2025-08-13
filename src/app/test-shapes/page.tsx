'use client';

import React from 'react';
import {
  UserShape,
  ProcessShape,
  DecisionShape,
  DataShape,
  TerminalShape,
  DocumentShape,
  ServiceShape,
  ApiShape,
  PageShape
} from '@/components/react-flow/components/FlowchartShapes';

export default function TestShapesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-center mb-12">🎨 Flowchart Shapes Test</h1>
        
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-items-center">
          <div className="text-center">
            <UserShape label="User" />
            <p className="mt-2 text-sm text-gray-600">User Shape</p>
          </div>
          
          <div className="text-center">
            <ProcessShape label="Process" />
            <p className="mt-2 text-sm text-gray-600">Process Shape</p>
          </div>
          
          <div className="text-center">
            <DecisionShape label="Decision" />
            <p className="mt-2 text-sm text-gray-600">Decision Shape</p>
          </div>
          
          <div className="text-center">
            <DataShape label="Data" />
            <p className="mt-2 text-sm text-gray-600">Data Shape</p>
          </div>
          
          <div className="text-center">
            <TerminalShape label="Terminal" />
            <p className="mt-2 text-sm text-gray-600">Terminal Shape</p>
          </div>
          
          <div className="text-center">
            <DocumentShape label="Document" />
            <p className="mt-2 text-sm text-gray-600">Document Shape</p>
          </div>
          
          <div className="text-center">
            <ServiceShape label="Service" />
            <p className="mt-2 text-sm text-gray-600">Service Shape</p>
          </div>
          
          <div className="text-center">
            <ApiShape label="API" />
            <p className="mt-2 text-sm text-gray-600">API Shape</p>
          </div>
          
          <div className="text-center">
            <PageShape label="Page" />
            <p className="mt-2 text-sm text-gray-600">Page Shape</p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">🔄 Node Type Mapping</h2>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div><strong>User:</strong> <span className="text-blue-600">UserShape</span> - รูปคนสำหรับ User flows</div>
              <div><strong>Page:</strong> <span className="text-green-600">PageShape</span> - รูป Browser สำหรับ Web pages</div>
              <div><strong>Service:</strong> <span className="text-gray-600">ServiceShape</span> - รูป Cloud สำหรับ Background services</div>
              <div><strong>API Call:</strong> <span className="text-pink-600">ApiShape</span> - รูป Hexagon สำหรับ API endpoints</div>
              <div><strong>Database:</strong> <span className="text-purple-600">DataShape</span> - รูป Cylinder สำหรับ Data storage</div>
              <div><strong>Logic/Condition:</strong> <span className="text-yellow-600">DecisionShape</span> - รูป Diamond สำหรับ Decision points</div>
              <div><strong>Transform/Function:</strong> <span className="text-green-600">ProcessShape</span> - รูป Rectangle สำหรับ Processing</div>
              <div><strong>Display/Export:</strong> <span className="text-cyan-600">DocumentShape</span> - รูป Document สำหรับ Output</div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/reactflow" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            🔗 ไปทดสอบใน ReactFlow
          </a>
        </div>
      </div>
    </div>
  );
}