# 🗄️ Database Management

## Overview
ฟีเจอร์ Database Management ใน DEVLOOP Platform ช่วยให้คุณสามารถจัดการ database connections, ดูข้อมูลตาราง และทำงานกับฐานข้อมูลได้แบบครบวงจร

## เข้าถึงฟีเจอร์
1. เข้าไปที่หน้า Dashboard (`http://localhost:3000/dashboard`)
2. คลิกเมนู **"Database"** ในแถบด้านซ้าย
3. จะเห็นหน้าจัดการ Database Connections

## คุณสมบัติหลัก

### 📊 Database Connections
- **รองรับ Database หลายประเภท**: MySQL, PostgreSQL, MongoDB, SQLite, Redis, Firebase
- **Connection Management**: เพิ่ม, แก้ไข, ลบ connections
- **Connection Testing**: ทดสอบการเชื่อมต่อแบบ real-time
- **Status Monitoring**: ติดตามสถานะการเชื่อมต่อ (Connected, Disconnected, Error)

### 🔍 Schema Viewer
- **Table Overview**: ดูรายชื่อตารางพร้อมข้อมูลสถิติ
- **Column Details**: ดูโครงสร้างคอลัมน์, data types, constraints
- **Primary Keys & Indexes**: แสดงข้อมูล keys และ indexes ชัดเจน
- **Table Statistics**: จำนวนแถว, ขนาดข้อมูล, วันที่อัปเดตล่าสุด

### ⚡ Demo System
- **Sample Connections**: ข้อมูลจำลองสำหรับทดสอบ
- **Realistic Data**: connections, tables และ queries ตัวอย่าง
- **Connection Simulation**: จำลองการเชื่อมต่อ database จริง

## วิธีใช้งาน

### เพิ่ม Database Connection ใหม่:
1. คลิกปุ่ม **"New Connection"** สีฟ้า
2. กรอกข้อมูล connection:
   - **Connection Name**: ชื่อ connection (เช่น "Production MySQL")
   - **Database Type**: เลือกประเภท database
   - **Host**: ที่อยู่ server (เช่น "localhost", "db.company.com")
   - **Port**: พอร์ต (จะถูกตั้งค่าอัตโนมัติตาม database type)
   - **Database Name**: ชื่อ database
   - **Username/Password**: ข้อมูลสำหรับเข้าถึง
3. คลิก **"Create Connection"**

### ทดสอบการเชื่อมต่อ:
1. หา connection card ที่ต้องการทดสอบ
2. คลิกปุ่ม **Play** (▶️) 
3. ดูสถานะการเชื่อมต่อเปลี่ยนเป็น "Testing..." แล้วเป็น "Connected" หรือ "Error"

### ดู Database Schema:
1. connection ที่สถานะ "Connected"
2. คลิกปุ่ม **Eye** (👁️) เพื่อดูตาราง
3. เลือกตารางเพื่อดูรายละเอียดคอลัมน์

### ใช้ Demo Data:
1. คลิกปุ่ม **"Load Demo Data"** สีเขียว
2. จะได้ demo connections 4 ตัว:
   - **Production MySQL** (Connected)
   - **Development PostgreSQL** (Connected)  
   - **Analytics MongoDB** (Disconnected)
   - **Cache Redis** (Error)

## Database Types ที่รองรับ

| Database | Default Port | Description |
|----------|-------------|-------------|
| MySQL | 3306 | Relational database ยอดนิยม |
| PostgreSQL | 5432 | Advanced open-source relational database |
| MongoDB | 27017 | NoSQL document database |
| SQLite | N/A | Embedded SQL database |
| Redis | 6379 | In-memory data structure store |
| Firebase | 443 | Google's mobile/web application platform |

## Connection States

- 🟢 **Connected**: เชื่อมต่อสำเร็จ พร้อมใช้งาน
- 🟡 **Testing**: กำลังทดสอบการเชื่อมต่อ
- ⚪ **Disconnected**: ยังไม่ได้เชื่อมต่อ
- 🔴 **Error**: เชื่อมต่อไม่สำเร็จ

## การใช้งานขั้นสูง

### Database Schema Information:
- **Primary Key**: คอลัมน์ที่เป็น primary key (มี key icon 🔑)
- **Indexed**: คอลัมน์ที่มี index (มี hash icon #️⃣)
- **Data Types**: แสดงชนิดข้อมูลพร้อม length
- **Nullable**: ระบุว่าคอลัมน์สามารถเป็น NULL ได้หรือไม่
- **Default Values**: ค่า default ของคอลัมน์

### Connection Management:
- **Edit**: แก้ไขข้อมูล connection (password จะถูกซ่อน)
- **Delete**: ลบ connection (รวมถึงข้อมูลที่เกี่ยวข้อง)
- **Test**: ทดสอบการเชื่อมต่อแบบ real-time

## Technical Implementation

### Components:
- `DatabaseContext` - จัดการ state และ operations
- `DatabaseConnectionCard` - แสดง connection cards
- `DatabaseConnectionModal` - form สำหรับเพิ่ม/แก้ไข connections  
- `DatabaseTablesView` - แสดงตารางและ schema details

### Features:
- **Real-time Testing**: simulation การทดสอบ connection
- **Demo Data Generation**: สร้างข้อมูลตัวอย่างแบบสมจริง
- **Responsive Design**: ใช้งานได้ทั้งเดสก์ทอปและมือถือ
- **Error Handling**: แสดง error messages ชัดเจน

## การขยายฟีเจอร์ในอนาคต
- 📝 **Query Editor**: เขียนและรัน SQL queries
- 📊 **Data Visualization**: แสดงข้อมูลเป็นกราฟ
- 🔄 **Database Migration Tools**: เครื่องมือย้ายข้อมูล
- 🔐 **Advanced Security**: SSL connections, encrypted passwords
- 📋 **Backup & Restore**: สำรองและกู้คืนข้อมูล

## Tips การใช้งาน

1. **Connection Names**: ใช้ชื่อที่บ่งบอกถึง environment (เช่น "Prod-MySQL", "Dev-Postgres")
2. **Testing**: ทดสอบ connection หลังสร้างเสมอ
3. **Demo Data**: ใช้เพื่อทดลองใช้งานก่อน connect database จริง
4. **Security**: ระวังการกรอก password ใน production environment

---
*สร้างด้วย DEVLOOP Platform - Database Management* 🗄️