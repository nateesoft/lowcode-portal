# 🤝 Collaborative Features

## Overview
หน้า `/reactflow` ได้รองรับการทำงานแบบ collaborative real-time ที่ช่วยให้ผู้ใช้หลายคนสามารถทำงานร่วมกันบน flow diagram เดียวกันได้

## Features

### 1. 👥 Collaborative Users Panel
- แสดงรายชื่อผู้ใช้ที่กำลัง online และ offline
- แสดงสถานะการทำงานของแต่ละคน (editing node, active, online)
- แสดงเวลาที่ active ล่าสุด

### 2. 🎯 Live Cursors
- แสดง cursor ของผู้ใช้อื่นแบบ real-time
- แสดงชื่อผู้ใช้ที่ cursor
- มีการเคลื่อนไหวแบบ smooth transition

### 3. 🎨 Node Indicators
- แสดง avatar ของผู้ใช้ที่กำลัง edit node
- มีการ pulse animation เพื่อบ่งบอกว่ากำลังมีการแก้ไข
- รองรับการแสดงผู้ใช้หลายคนบน node เดียว

## How to Use

### เปิดโหมด Collaboration:
1. เข้าไปที่หน้า `/reactflow`
2. คลิกปุ่ม **"Enable Collaboration"** ที่มุมบนขวา
3. ระบบจะสร้าง demo users และเริ่มการทำงานแบบ collaborative

### ฟีเจอร์ต่างๆ ที่จะเห็น:
- **Users Panel**: แสดงรายชื่อและสถานะของผู้ใช้
- **Live Cursors**: จุดสีต่างๆ ที่เคลื่อนไหวแสดง cursor ของผู้ใช้อื่น
- **Node Indicators**: วงกลมสีบน nodes ที่กำลังถูกแก้ไข

### ปิดโหมด Collaboration:
- คลิก **"Exit"** ในหน้า Users Panel

## Technical Implementation

### Components:
- `CollaborationContext` - จัดการ state ของ users และ collaborative features
- `CollaborativeUsersPanel` - UI แสดงรายชื่อผู้ใช้
- `CollaborativeCursors` - แสดง cursors ของผู้ใช้อื่น
- `CollaborativeNodeIndicator` - แสดง indicators บน nodes

### Demo Data:
ระบบมี demo users ดังนี้:
- **Sarah Chen** (สีแดง) - มี cursor เคลื่อนไหว
- **Mike Johnson** (สีเขียว) - กำลัง edit node
- **Anna Rodriguez** (สีส้ม) - มี cursor เคลื่อนไหว  
- **David Kim** (สีม่วง) - offline

### Real-time Simulation:
- Cursors จะเคลื่อนไหวทุก 3 วินาทีแบบสุ่ม
- การจำลองจะหยุดหลังจาก 30 วินาที

## Future Enhancements
- เชื่อมต่อกับ WebSocket สำหรับ real-time collaboration จริง
- เพิ่ม voice/video chat
- เพิ่ม collaborative editing บน node properties
- เพิ่ม comment system บน nodes
- เพิ่ม version control และ change history

## Screenshots
เมื่อเปิดใช้งาน collaborative mode จะเห็น:
1. Users panel ที่มุมบนขวา
2. Cursors สีต่างๆ เคลื่อนไหวบนหน้าจอ
3. Indicators บน nodes ที่กำลังถูกแก้ไข

---
*สร้างด้วย DEVLOOP Platform - Collaborative Flow Builder* 🚀