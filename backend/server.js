const express = require('express');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ================= INVENTORY =================

let items = [];

try {
    const data = fs.readFileSync('items.json');
    items = JSON.parse(data);
} catch {
    items = [];
}

function saveItems() {
    fs.writeFileSync('items.json', JSON.stringify(items, null, 2));
}

// Add Item
app.post('/add-item', (req, res) => {
    const { name, price, quantity } = req.body;

    const newItem = {
        id: items.length + 1,
        name,
        price,
        quantity
    };

    items.push(newItem);
    saveItems();

    res.send("Item Added");
});

// Get Items
app.get('/items', (req, res) => {
    res.json(items);
});


// ================= STAFF =================

let staff = [];

try {
    const data = fs.readFileSync('staff.json');
    staff = JSON.parse(data);
} catch {
    staff = [];
}

function saveStaff() {
    fs.writeFileSync('staff.json', JSON.stringify(staff, null, 2));
}

// Add Staff
app.post('/add-staff', (req, res) => {
    const { name, role, salary, shift } = req.body;

    const newStaff = {
        id: staff.length + 1,
        name,
        role,
        salary,
        shift
    };

    staff.push(newStaff);
    saveStaff();

    res.send("Staff Added");
});

// Get Staff
app.get('/staff', (req, res) => {
    res.json(staff);
});


// ================= GST BILL =================

app.post('/generate-bill', (req, res) => {
    const { customerName, items } = req.body;

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bill.pdf');

    doc.pipe(res);

    doc.fontSize(20).text("GST BILL", { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Customer: ${customerName}`);
    doc.moveDown();

    let total = 0;

    items.forEach(item => {
        const amount = item.price * item.quantity;
        total += amount;
        doc.text(`${item.name} - ${item.quantity} x ₹${item.price} = ₹${amount}`);
    });

    const gst = total * 0.18;
    const finalTotal = total + gst;

    doc.moveDown();
    doc.text(`Subtotal: ₹${total}`);
    doc.text(`GST (18%): ₹${gst}`);
    doc.text(`Total: ₹${finalTotal}`);

    doc.end();
});


// ================= START SERVER =================

app.listen(5000, () => {
    console.log("✅ Server running on http://localhost:5000");
});