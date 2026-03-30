"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
const USERS = [
    { email: 'batch_operator@ebmr.dev', name: 'Alex Operator', role: 'BATCH_OPERATOR', password: 'Test@1234' },
    { email: 'supervisor@ebmr.dev', name: 'Sam Supervisor', role: 'SUPERVISOR', password: 'Test@1234' },
    { email: 'qa_reviewer@ebmr.dev', name: 'Quinn Reviewer', role: 'QA_REVIEWER', password: 'Test@1234' },
    { email: 'qa_manager@ebmr.dev', name: 'Morgan Manager', role: 'QA_MANAGER', password: 'Test@1234' },
    { email: 'qualified_person@ebmr.dev', name: 'Jordan QP', role: 'QUALIFIED_PERSON', password: 'Test@1234' },
];
const TEMPLATES = [
    {
        productCode: 'PARA-500',
        productName: 'Paracetamol 500mg Tablet',
        steps: [
            {
                step_number: 1,
                title: 'Dispensing',
                instructions: 'Verify ingredient weights on calibrated scale. Record actual weights for paracetamol and starch.',
                required_fields: [
                    { name: 'paracetamol_g', label: 'Paracetamol (g)', type: 'number', min: 495, max: 505, unit: 'g' },
                    { name: 'starch_g', label: 'Starch (g)', type: 'number', min: 48, max: 52, unit: 'g' },
                ],
            },
            {
                step_number: 2,
                title: 'Dry Mixing',
                instructions: 'Mix ingredients in blender. Record mixing duration.',
                required_fields: [
                    { name: 'duration_min', label: 'Mixing Duration (min)', type: 'number', min: 13, max: 17, unit: 'min' },
                ],
            },
            {
                step_number: 3,
                title: 'Granulation',
                instructions: 'Perform wet granulation. Measure moisture content of granules.',
                required_fields: [
                    { name: 'moisture_pct', label: 'Moisture Content (%)', type: 'number', min: 3.0, max: 4.0, unit: '%' },
                ],
            },
            {
                step_number: 4,
                title: 'Tablet Compression',
                instructions: 'Compress granules into tablets. Record hardness and weight.',
                required_fields: [
                    { name: 'hardness_kp', label: 'Tablet Hardness (kP)', type: 'number', min: 6.5, max: 9.5, unit: 'kP' },
                    { name: 'weight_mg', label: 'Tablet Weight (mg)', type: 'number', min: 490, max: 510, unit: 'mg' },
                ],
            },
            {
                step_number: 5,
                title: 'Visual Inspection',
                instructions: 'Inspect tablets for defects (cracks, chips, discoloration). Record defect count.',
                required_fields: [
                    { name: 'defects_count', label: 'Defects Count', type: 'number', min: 0, exact_max: 0, unit: 'units' },
                ],
            },
        ],
    },
    {
        productCode: 'AMOX-250',
        productName: 'Amoxicillin 250mg Capsule',
        steps: [
            {
                step_number: 1,
                title: 'Dispensing',
                instructions: 'Verify ingredient weights for amoxicillin and lactose.',
                required_fields: [
                    { name: 'amoxicillin_g', label: 'Amoxicillin (g)', type: 'number', min: 247, max: 253, unit: 'g' },
                    { name: 'lactose_g', label: 'Lactose (g)', type: 'number', min: 75, max: 85, unit: 'g' },
                ],
            },
            {
                step_number: 2,
                title: 'Blending',
                instructions: 'Blend amoxicillin with excipients in tumble blender.',
                required_fields: [
                    { name: 'blend_time_min', label: 'Blend Time (min)', type: 'number', min: 17, max: 23, unit: 'min' },
                ],
            },
            {
                step_number: 3,
                title: 'Capsule Filling',
                instructions: 'Fill hard gelatin capsules. Check fill weight.',
                required_fields: [
                    { name: 'fill_weight_mg', label: 'Fill Weight (mg)', type: 'number', min: 320, max: 340, unit: 'mg' },
                ],
            },
            {
                step_number: 4,
                title: 'Capsule Polishing',
                instructions: 'Polish filled capsules in polishing drum.',
                required_fields: [
                    { name: 'polishing_time_min', label: 'Polishing Time (min)', type: 'number', min: 8, max: 12, unit: 'min' },
                ],
            },
            {
                step_number: 5,
                title: 'Visual Inspection',
                instructions: 'Inspect capsules for defects. Record total defect count.',
                required_fields: [
                    { name: 'defects_count', label: 'Defects Count', type: 'number', min: 0, exact_max: 0, unit: 'units' },
                ],
            },
        ],
    },
];
const MATERIALS = [
    { materialCode: 'RM-PARA-API', materialName: 'Paracetamol API', unit: 'g', description: 'Active pharmaceutical ingredient - Paracetamol' },
    { materialCode: 'RM-STARCH', materialName: 'Maize Starch', unit: 'g', description: 'Excipient - binder/disintegrant' },
    { materialCode: 'RM-MG-STEARATE', materialName: 'Magnesium Stearate', unit: 'g', description: 'Excipient - lubricant' },
    { materialCode: 'RM-PVP-K30', materialName: 'PVP K-30 (Binder)', unit: 'g', description: 'Polyvinylpyrrolidone - granulation binder' },
    { materialCode: 'RM-PURIFIED-WATER', materialName: 'Purified Water', unit: 'mL', description: 'Granulation solvent (USP grade)' },
    { materialCode: 'RM-AMOX-API', materialName: 'Amoxicillin Trihydrate API', unit: 'g', description: 'Active pharmaceutical ingredient - Amoxicillin' },
    { materialCode: 'RM-LACTOSE', materialName: 'Lactose Monohydrate', unit: 'g', description: 'Excipient - filler/diluent' },
    { materialCode: 'RM-CAPSULE-0', materialName: 'Hard Gelatin Capsule Size 0', unit: 'units', description: 'Empty hard gelatin capsule shells, size 0' },
    { materialCode: 'RM-TALC', materialName: 'Talc', unit: 'g', description: 'Excipient - glidant' },
];
const BOM_ITEMS = {
    'PARA-500': [
        { materialCode: 'RM-PARA-API', qtyPerKg: 500, notes: 'Core API — exact dispensing required' },
        { materialCode: 'RM-STARCH', qtyPerKg: 50, notes: 'Disintegrant' },
        { materialCode: 'RM-PVP-K30', qtyPerKg: 30, notes: 'Granulation binder solution 10% w/v' },
        { materialCode: 'RM-MG-STEARATE', qtyPerKg: 5, notes: 'Add at final blending stage only' },
        { materialCode: 'RM-PURIFIED-WATER', qtyPerKg: 200, notes: 'Granulation solvent — evaporated during drying' },
    ],
    'AMOX-250': [
        { materialCode: 'RM-AMOX-API', qtyPerKg: 250, notes: 'Handle in BSC — hygroscopic' },
        { materialCode: 'RM-LACTOSE', qtyPerKg: 80, notes: 'Diluent' },
        { materialCode: 'RM-TALC', qtyPerKg: 15, notes: 'Glidant' },
        { materialCode: 'RM-MG-STEARATE', qtyPerKg: 5, notes: 'Lubricant — add last, blend 3 min max' },
        { materialCode: 'RM-CAPSULE-0', qtyPerKg: 2857, notes: 'Approx 350 mg fill weight per capsule' },
    ],
};
async function main() {
    console.log('Seeding database...');
    for (const u of USERS) {
        const passwordHash = await bcrypt.hash(u.password, 10);
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: { email: u.email, name: u.name, role: u.role, passwordHash },
        });
        console.log(`  User: ${u.email} (${u.role})`);
    }
    for (const t of TEMPLATES) {
        await prisma.batchTemplate.upsert({
            where: { productCode: t.productCode },
            update: {},
            create: { productCode: t.productCode, productName: t.productName, steps: t.steps },
        });
        console.log(`  Template: ${t.productName}`);
    }
    const materialMap = {};
    for (const m of MATERIALS) {
        const mat = await prisma.material.upsert({
            where: { materialCode: m.materialCode },
            update: {},
            create: m,
        });
        materialMap[m.materialCode] = mat.id;
        console.log(`  Material: ${m.materialCode}`);
    }
    for (const [productCode, items] of Object.entries(BOM_ITEMS)) {
        const template = await prisma.batchTemplate.findUnique({ where: { productCode } });
        if (!template)
            continue;
        for (const item of items) {
            const materialId = materialMap[item.materialCode];
            if (!materialId)
                continue;
            await prisma.bomItem.upsert({
                where: { templateId_materialId: { templateId: template.id, materialId } },
                update: { qtyPerKg: item.qtyPerKg, notes: item.notes },
                create: { templateId: template.id, materialId, qtyPerKg: item.qtyPerKg, notes: item.notes },
            });
            console.log(`  BoM: ${productCode} + ${item.materialCode}`);
        }
    }
    console.log('Seed complete.');
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map