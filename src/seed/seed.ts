import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const USERS = [
  { email: 'batch_operator@ebmr.dev', name: 'Alex Operator', role: 'BATCH_OPERATOR', password: 'Test@1234' },
  { email: 'supervisor@ebmr.dev', name: 'Sam Supervisor', role: 'SUPERVISOR', password: 'Test@1234' },
  { email: 'qa_reviewer@ebmr.dev', name: 'Quinn Reviewer', role: 'QA_REVIEWER', password: 'Test@1234' },
  { email: 'qa_manager@ebmr.dev', name: 'Morgan Manager', role: 'QA_MANAGER', password: 'Test@1234' },
  { email: 'qualified_person@ebmr.dev', name: 'Jordan QP', role: 'QUALIFIED_PERSON', password: 'Test@1234' },
  { email: 'lab_analyst@ebmr.dev', name: 'Lab Analyst', role: 'LAB_ANALYST', password: 'Test@1234' },
  { email: 'admin@ebmr.dev', name: 'System Admin', role: 'SYSTEM_ADMIN', password: 'Test@1234' },
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

// Materials master list
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

// BoM: qty per 1 kg of batch output
const BOM_ITEMS: Record<string, { materialCode: string; qtyPerKg: number; notes?: string }[]> = {
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

// ─── New seed data ────────────────────────────────────────────────────────────

// SOPs
const SOPS = [
  {
    sop_code: 'SOP-CAPS-001',
    title: 'Amoxicillin Capsule Manufacturing SOP',
    version: '1.0',
    product_category: 'CAPSULE',
    status: 'APPROVED' as const,
    sections: [
      { section_no: 1, title: 'Scope', content: 'This SOP applies to the manufacture of Amoxicillin 250mg Hard Gelatin Capsules at all production scales.', is_critical: false },
      { section_no: 2, title: 'Materials', content: 'Amoxicillin Trihydrate API, Lactose Monohydrate, Talc, Magnesium Stearate, Hard Gelatin Capsule shells (Size 0). All materials must be released by QC before use.', is_critical: true },
      { section_no: 3, title: 'Equipment', content: 'Tumble blender (validated), Capsule filling machine (calibrated), Polishing drum, Analytical balance (±0.1 mg accuracy).', is_critical: false },
      { section_no: 4, title: 'Procedure', content: 'Step 1: Dispense all materials per BOM. Step 2: Blend API with excipients for 20 min ±3 min. Step 3: Fill capsules to target weight 330 mg ±10 mg. Step 4: Polish capsules for 10 min. Step 5: Inspect 100% for visible defects.', is_critical: true },
      { section_no: 5, title: 'QC Requirements', content: 'IQC: Verify CoA, check material appearance and odour. LQC: Fill weight check every 30 min, moisture content of blend. OQC: Dissolution test per USP, Assay by HPLC, Microbial limits.', is_critical: true },
    ],
    qc_parameter_sets: [
      {
        name: 'Incoming QC — Raw Material Check',
        qc_stage: 'IQC' as const,
        parameters: [
          { param_code: 'IQC-AMOX-001', name: 'Identity by IR', data_type: 'BOOLEAN' as const, is_mandatory: true, display_order: 1 },
          { param_code: 'IQC-AMOX-002', name: 'Appearance', data_type: 'TEXT' as const, is_mandatory: true, display_order: 2 },
          { param_code: 'IQC-AMOX-003', name: 'Water Content (%)', data_type: 'NUMERIC' as const, unit: '%', min_value: 11.5, max_value: 14.5, is_mandatory: true, display_order: 3 },
        ],
      },
      {
        name: 'In-Process QC — Fill Weight & Moisture',
        qc_stage: 'LQC' as const,
        parameters: [
          { param_code: 'LQC-AMOX-001', name: 'Capsule Fill Weight (mg)', data_type: 'NUMERIC' as const, unit: 'mg', min_value: 320, max_value: 340, target_value: 330, is_mandatory: true, display_order: 1 },
          { param_code: 'LQC-AMOX-002', name: 'Blend Moisture (%)', data_type: 'NUMERIC' as const, unit: '%', min_value: 0, max_value: 2.0, is_mandatory: true, display_order: 2 },
        ],
      },
      {
        name: 'Outgoing QC — Dissolution & Assay',
        qc_stage: 'OQC' as const,
        parameters: [
          { param_code: 'OQC-AMOX-001', name: 'Dissolution at 45 min (%)', data_type: 'NUMERIC' as const, unit: '%', min_value: 80, is_mandatory: true, display_order: 1 },
          { param_code: 'OQC-AMOX-002', name: 'Assay by HPLC (%)', data_type: 'NUMERIC' as const, unit: '%', min_value: 90, max_value: 110, target_value: 100, is_mandatory: true, display_order: 2 },
        ],
      },
    ],
  },
  {
    sop_code: 'SOP-TAB-001',
    title: 'Paracetamol Tablet Manufacturing SOP',
    version: '1.0',
    product_category: 'TABLET',
    status: 'APPROVED' as const,
    sections: [
      { section_no: 1, title: 'Scope', content: 'This SOP covers the manufacture of Paracetamol 500mg Tablets including dispensing, granulation, compression and inspection.', is_critical: false },
      { section_no: 2, title: 'Materials', content: 'Paracetamol API, Maize Starch, PVP K-30, Magnesium Stearate, Purified Water. All materials must carry a QC release label.', is_critical: true },
      { section_no: 3, title: 'Equipment', content: 'High shear granulator (validated), Fluid bed dryer, Tablet press (instrumented), Hardness tester.', is_critical: false },
      { section_no: 4, title: 'Procedure', content: 'Step 1: Dispense API and excipients per BOM. Step 2: Dry mix 15 min. Step 3: Granulate with PVP binder solution. Step 4: Dry to moisture <2%. Step 5: Compress to target weight 600 mg, hardness 8 kP. Step 6: Inspect.', is_critical: true },
      { section_no: 5, title: 'QC Requirements', content: 'IQC: Verify CoA, ID test by UV. LQC: Moisture, tablet hardness, weight. OQC: Disintegration time, Assay, Dissolution.', is_critical: true },
    ],
    qc_parameter_sets: [
      {
        name: 'Incoming QC — Paracetamol API',
        qc_stage: 'IQC' as const,
        parameters: [
          { param_code: 'IQC-PARA-001', name: 'Identity by UV', data_type: 'BOOLEAN' as const, is_mandatory: true, display_order: 1 },
          { param_code: 'IQC-PARA-002', name: 'Melting Point (°C)', data_type: 'NUMERIC' as const, unit: '°C', min_value: 168, max_value: 172, is_mandatory: true, display_order: 2 },
        ],
      },
      {
        name: 'In-Process QC — Granules & Tablets',
        qc_stage: 'LQC' as const,
        parameters: [
          { param_code: 'LQC-PARA-001', name: 'Granule Moisture (%)', data_type: 'NUMERIC' as const, unit: '%', min_value: 1.5, max_value: 3.0, is_mandatory: true, display_order: 1 },
          { param_code: 'LQC-PARA-002', name: 'Tablet Hardness (kP)', data_type: 'NUMERIC' as const, unit: 'kP', min_value: 6.5, max_value: 9.5, target_value: 8.0, is_mandatory: true, display_order: 2 },
          { param_code: 'LQC-PARA-003', name: 'Tablet Weight (mg)', data_type: 'NUMERIC' as const, unit: 'mg', min_value: 490, max_value: 510, target_value: 500, is_mandatory: true, display_order: 3 },
        ],
      },
      {
        name: 'Outgoing QC — Finished Tablet',
        qc_stage: 'OQC' as const,
        parameters: [
          { param_code: 'OQC-PARA-001', name: 'Disintegration Time (min)', data_type: 'NUMERIC' as const, unit: 'min', max_value: 15, is_mandatory: true, display_order: 1 },
          { param_code: 'OQC-PARA-002', name: 'Assay by HPLC (%)', data_type: 'NUMERIC' as const, unit: '%', min_value: 95, max_value: 105, target_value: 100, is_mandatory: true, display_order: 2 },
        ],
      },
    ],
  },
];

// Dynamic BOMs
const BOMS = [
  {
    bom_code: 'BOM-CAPS-AMOX-250',
    product_name: 'Amoxicillin 250mg Capsule',
    product_code: 'AMOX-250',
    product_variant: 'Standard',
    base_batch_size: 100000,
    base_unit: 'capsules',
    version: '1.0',
    status: 'APPROVED' as const,
    components: [
      { material_code: 'RM-AMOX-API', material_name: 'Amoxicillin Trihydrate API', component_type: 'ACTIVE' as const, quantity_per_base_batch: 33000, unit: 'g', overage_pct: 2, is_critical: true, display_order: 1, substitutes: [] },
      { material_code: 'RM-LACTOSE', material_name: 'Lactose Monohydrate', component_type: 'EXCIPIENT' as const, quantity_per_base_batch: 10500, unit: 'g', overage_pct: 0, is_critical: false, display_order: 2, substitutes: [] },
      { material_code: 'RM-TALC', material_name: 'Talc', component_type: 'EXCIPIENT' as const, quantity_per_base_batch: 2000, unit: 'g', overage_pct: 0, is_critical: false, display_order: 3, substitutes: [] },
      { material_code: 'RM-MG-STEARATE', material_name: 'Magnesium Stearate', component_type: 'LUBRICANT' as const, quantity_per_base_batch: 500, unit: 'g', overage_pct: 0, is_critical: false, display_order: 4, substitutes: [] },
      { material_code: 'RM-CAPSULE-0', material_name: 'Hard Gelatin Capsule Size 0', component_type: 'PACKAGING' as const, quantity_per_base_batch: 102000, unit: 'units', overage_pct: 2, is_critical: true, display_order: 5, substitutes: [] },
    ],
    process_steps: [
      { step_number: 1, title: 'Dispensing', description: 'Weigh and dispense all raw materials as per BOM. Verify weights against approved BOM.', equipment_type: 'Analytical Balance', duration_min: 60, is_critical_step: true, scalable_params: [] },
      { step_number: 2, title: 'Blending', description: 'Load materials into tumble blender. Blend for 20 min at 15 rpm.', equipment_type: 'Tumble Blender', duration_min: 30, is_critical_step: true, scalable_params: [] },
      { step_number: 3, title: 'Capsule Filling', description: 'Fill blend into hard gelatin capsules. Target fill weight 330 mg ± 10 mg.', equipment_type: 'Capsule Filling Machine', duration_min: 180, is_critical_step: true, scalable_params: [] },
      { step_number: 4, title: 'Polishing', description: 'Polish filled capsules in polishing drum for 10 min.', equipment_type: 'Polishing Drum', duration_min: 15, is_critical_step: false, scalable_params: [] },
      { step_number: 5, title: 'Inspection', description: '100% visual inspection for defects. Sample for QC testing.', equipment_type: 'Inspection Belt', duration_min: 120, is_critical_step: true, scalable_params: [] },
    ],
  },
  {
    bom_code: 'BOM-TAB-PARA-500',
    product_name: 'Paracetamol 500mg Tablet',
    product_code: 'PARA-500',
    product_variant: 'Standard',
    base_batch_size: 200000,
    base_unit: 'tablets',
    version: '1.0',
    status: 'APPROVED' as const,
    components: [
      { material_code: 'RM-PARA-API', material_name: 'Paracetamol API', component_type: 'ACTIVE' as const, quantity_per_base_batch: 100000, unit: 'g', overage_pct: 1, is_critical: true, display_order: 1, substitutes: [] },
      { material_code: 'RM-STARCH', material_name: 'Maize Starch', component_type: 'DISINTEGRANT' as const, quantity_per_base_batch: 10000, unit: 'g', overage_pct: 0, is_critical: false, display_order: 2, substitutes: [] },
      { material_code: 'RM-PVP-K30', material_name: 'PVP K-30 (Binder)', component_type: 'EXCIPIENT' as const, quantity_per_base_batch: 6000, unit: 'g', overage_pct: 0, is_critical: false, display_order: 3, substitutes: [] },
      { material_code: 'RM-MG-STEARATE', material_name: 'Magnesium Stearate', component_type: 'LUBRICANT' as const, quantity_per_base_batch: 1000, unit: 'g', overage_pct: 0, is_critical: false, display_order: 4, substitutes: [] },
      { material_code: 'RM-PURIFIED-WATER', material_name: 'Purified Water', component_type: 'EXCIPIENT' as const, quantity_per_base_batch: 40000, unit: 'mL', overage_pct: 0, is_critical: false, display_order: 5, substitutes: [] },
    ],
    process_steps: [
      { step_number: 1, title: 'Dispensing', description: 'Dispense all materials per BOM. Check weights and labels.', equipment_type: 'Analytical Balance', duration_min: 60, is_critical_step: true, scalable_params: [] },
      { step_number: 2, title: 'Dry Mixing', description: 'Dry mix API with starch in high shear granulator for 15 min.', equipment_type: 'High Shear Granulator', duration_min: 20, is_critical_step: false, scalable_params: [] },
      { step_number: 3, title: 'Granulation', description: 'Add PVP binder solution and granulate. Dry in fluid bed to moisture <2%.', equipment_type: 'Fluid Bed Dryer', duration_min: 90, is_critical_step: true, scalable_params: [] },
      { step_number: 4, title: 'Tablet Compression', description: 'Compress granules. Target weight 500 mg, hardness 8 kP.', equipment_type: 'Tablet Press', duration_min: 120, is_critical_step: true, scalable_params: [] },
      { step_number: 5, title: 'Visual Inspection', description: 'Inspect for chips, cracks, discoloration. Sample for QC.', equipment_type: 'Inspection Belt', duration_min: 60, is_critical_step: true, scalable_params: [] },
    ],
  },
];

// QC Checklists
const QC_CHECKLISTS = [
  {
    checklist_code: 'CHK-IQC-001',
    title: 'Raw Material Inward QC Checklist',
    qc_stage: 'IQC' as const,
    applicable_to: ['AMOX-250', 'PARA-500'],
    version: '1.0',
    status: 'APPROVED' as const,
    items: [
      { item_number: 1, category: 'DOCUMENTATION' as const, instruction: 'Verify Certificate of Analysis (CoA) received from supplier matches purchase order specifications.', is_mandatory: true, requires_value: false },
      { item_number: 2, category: 'SAFETY' as const, instruction: 'Check container integrity — no leaks, damage, or broken seals. Photograph any discrepancies.', is_mandatory: true, requires_value: false },
      { item_number: 3, category: 'EQUIPMENT' as const, instruction: 'Record ambient temperature and humidity at time of receipt using calibrated instruments.', is_mandatory: true, requires_value: true, value_label: 'Temperature (°C)', value_type: 'NUMERIC' as const },
      { item_number: 4, category: 'DOCUMENTATION' as const, instruction: 'Verify expiry date on container label against CoA. Reject if expiry is within 6 months.', is_mandatory: true, requires_value: false },
      { item_number: 5, category: 'PROCEDURE' as const, instruction: 'Weigh representative sample as per sampling plan. Record actual weight.', is_mandatory: true, requires_value: true, value_label: 'Sample Weight (g)', value_type: 'NUMERIC' as const },
    ],
  },
  {
    checklist_code: 'CHK-LQC-001',
    title: 'In-Process QC Checklist',
    qc_stage: 'LQC' as const,
    applicable_to: ['AMOX-250', 'PARA-500'],
    version: '1.0',
    status: 'APPROVED' as const,
    items: [
      { item_number: 1, category: 'EQUIPMENT' as const, instruction: 'Verify all equipment is clean and bears a valid "Cleaned" label. Record equipment ID and cleaning date.', is_mandatory: true, requires_value: false },
      { item_number: 2, category: 'PROCEDURE' as const, instruction: 'Confirm blend uniformity sample taken at start, middle, and end of blending.', is_mandatory: true, requires_value: false },
      { item_number: 3, category: 'PROCEDURE' as const, instruction: 'Record in-process fill weight / tablet weight check results at every 30 min interval.', is_mandatory: true, requires_value: true, value_label: 'Average Weight (mg)', value_type: 'NUMERIC' as const },
      { item_number: 4, category: 'DOCUMENTATION' as const, instruction: 'All deviations from target parameters have been raised as deviation reports.', is_mandatory: true, requires_value: false },
      { item_number: 5, category: 'PREPARATION' as const, instruction: 'Environmental monitoring (differential pressure, particle count) recorded for manufacturing area.', is_mandatory: true, requires_value: true, value_label: 'Differential Pressure (Pa)', value_type: 'NUMERIC' as const },
    ],
  },
];

async function main() {
  console.log('Seeding database...');

  // ─── Users ────────────────────────────────────────────────────────────────
  const userMap: Record<string, string> = {};
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role as any,
        passwordHash,
        password_changed_at: new Date(),
        is_active: true,
      },
    });
    userMap[u.role] = user.id;
    console.log(`  User: ${u.email} (${u.role})`);
  }

  const qaManagerId = userMap['QA_MANAGER'];
  const supervisorId = userMap['SUPERVISOR'];

  // ─── Templates ────────────────────────────────────────────────────────────
  for (const t of TEMPLATES) {
    await prisma.batchTemplate.upsert({
      where: { productCode: t.productCode },
      update: {},
      create: { productCode: t.productCode, productName: t.productName, steps: t.steps },
    });
    console.log(`  Template: ${t.productName}`);
  }

  // ─── Materials ────────────────────────────────────────────────────────────
  const materialMap: Record<string, string> = {};
  for (const m of MATERIALS) {
    const mat = await prisma.material.upsert({
      where: { materialCode: m.materialCode },
      update: {},
      create: m,
    });
    materialMap[m.materialCode] = mat.id;
    console.log(`  Material: ${m.materialCode}`);
  }

  // ─── Legacy BomItems ──────────────────────────────────────────────────────
  for (const [productCode, items] of Object.entries(BOM_ITEMS)) {
    const template = await prisma.batchTemplate.findUnique({ where: { productCode } });
    if (!template) continue;
    for (const item of items) {
      const materialId = materialMap[item.materialCode];
      if (!materialId) continue;
      await prisma.bomItem.upsert({
        where: { templateId_materialId: { templateId: template.id, materialId } },
        update: { qtyPerKg: item.qtyPerKg, notes: item.notes },
        create: { templateId: template.id, materialId, qtyPerKg: item.qtyPerKg, notes: item.notes },
      });
      console.log(`  BoM: ${productCode} + ${item.materialCode}`);
    }
  }

  // ─── SOPs ─────────────────────────────────────────────────────────────────
  const sopMap: Record<string, string> = {};
  for (const s of SOPS) {
    const sop = await prisma.sOP.upsert({
      where: { sop_code: s.sop_code },
      update: {},
      create: {
        sop_code: s.sop_code,
        title: s.title,
        version: s.version,
        product_category: s.product_category,
        status: s.status,
        created_by: qaManagerId,
        approved_by: qaManagerId,
        approved_at: new Date(),
        effective_date: new Date(),
        review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    sopMap[s.sop_code] = sop.id;

    // Sections
    for (const sec of s.sections) {
      const existing = await prisma.sOPSection.findFirst({
        where: { sop_id: sop.id, section_no: sec.section_no },
      });
      if (!existing) {
        await prisma.sOPSection.create({
          data: { sop_id: sop.id, ...sec },
        });
      }
    }

    // QC Parameter Sets
    for (const ps of s.qc_parameter_sets) {
      const existingSet = await prisma.qCParameterSet.findFirst({
        where: { sop_id: sop.id, name: ps.name },
      });
      let paramSet = existingSet;
      if (!existingSet) {
        paramSet = await prisma.qCParameterSet.create({
          data: { sop_id: sop.id, name: ps.name, qc_stage: ps.qc_stage },
        });
      }
      if (paramSet) {
        for (const p of ps.parameters) {
          const existingParam = await prisma.qCParameter.findFirst({
            where: { parameter_set_id: paramSet.id, param_code: p.param_code },
          });
          if (!existingParam) {
            await prisma.qCParameter.create({
              data: { parameter_set_id: paramSet.id, ...p, options: [] },
            });
          }
        }
      }
    }
    console.log(`  SOP: ${s.sop_code} (${s.title})`);
  }

  // ─── Dynamic BOMs ─────────────────────────────────────────────────────────
  const bomMap: Record<string, string> = {};
  for (const b of BOMS) {
    const bom = await prisma.bOM.upsert({
      where: { bom_code: b.bom_code },
      update: {},
      create: {
        bom_code: b.bom_code,
        product_name: b.product_name,
        product_code: b.product_code,
        product_variant: b.product_variant,
        base_batch_size: b.base_batch_size,
        base_unit: b.base_unit,
        version: b.version,
        status: b.status,
        created_by: qaManagerId,
        approved_by: qaManagerId,
        approved_at: new Date(),
      },
    });
    bomMap[b.product_code] = bom.id;

    // Components
    const existingComponents = await prisma.bOMComponent.findMany({ where: { bom_id: bom.id } });
    if (existingComponents.length === 0) {
      for (const c of b.components) {
        await prisma.bOMComponent.create({ data: { bom_id: bom.id, ...c } });
      }
    }

    // Process Steps
    const existingSteps = await prisma.bOMProcessStep.findMany({ where: { bom_id: bom.id } });
    if (existingSteps.length === 0) {
      for (const step of b.process_steps) {
        await prisma.bOMProcessStep.create({ data: { bom_id: bom.id, ...step } });
      }
    }

    // Link BOM to SOP
    const sopCode = b.product_code === 'AMOX-250' ? 'SOP-CAPS-001' : 'SOP-TAB-001';
    const sopId = sopMap[sopCode];
    if (sopId) {
      const existingLink = await prisma.bOMSOPLink.findFirst({
        where: { bom_id: bom.id, sop_id: sopId },
      });
      if (!existingLink) {
        await prisma.bOMSOPLink.create({
          data: { bom_id: bom.id, sop_id: sopId, is_primary: true },
        });
      }
    }

    console.log(`  Dynamic BOM: ${b.bom_code} (${b.product_name})`);
  }

  // ─── QC Checklists ────────────────────────────────────────────────────────
  for (const cl of QC_CHECKLISTS) {
    const checklist = await prisma.qCChecklist.upsert({
      where: { checklist_code: cl.checklist_code },
      update: {},
      create: {
        checklist_code: cl.checklist_code,
        title: cl.title,
        qc_stage: cl.qc_stage,
        applicable_to: cl.applicable_to,
        version: cl.version,
        status: cl.status,
        created_by: qaManagerId,
        approved_by: qaManagerId,
        approved_at: new Date(),
      },
    });

    const existingItems = await prisma.checklistItem.findMany({ where: { checklist_id: checklist.id } });
    if (existingItems.length === 0) {
      for (const item of cl.items) {
        await prisma.checklistItem.create({
          data: { checklist_id: checklist.id, ...item },
        });
      }
    }
    console.log(`  QC Checklist: ${cl.checklist_code} (${cl.title})`);
  }

  // ─── Material Intents, POs, and Receipts ──────────────────────────────────
  const now = new Date();
  const intentAmox = await prisma.materialIntent.upsert({
    where: { intent_code: 'INT-2026-001' },
    update: {},
    create: {
      intent_code: 'INT-2026-001',
      material_name: 'Amoxicillin Trihydrate API',
      material_code: 'RM-AMOX-API',
      quantity_needed: 500000,
      unit: 'g',
      needed_by_date: new Date('2026-03-15'),
      reason: 'Q1 2026 production requirement',
      raised_by: supervisorId,
      status: 'FULFILLED',
    },
  });

  const intentPara = await prisma.materialIntent.upsert({
    where: { intent_code: 'INT-2026-002' },
    update: {},
    create: {
      intent_code: 'INT-2026-002',
      material_name: 'Paracetamol API',
      material_code: 'RM-PARA-API',
      quantity_needed: 1000000,
      unit: 'g',
      needed_by_date: new Date('2026-03-15'),
      reason: 'Q1 2026 production requirement',
      raised_by: supervisorId,
      status: 'FULFILLED',
    },
  });

  const intentLactose = await prisma.materialIntent.upsert({
    where: { intent_code: 'INT-2026-003' },
    update: {},
    create: {
      intent_code: 'INT-2026-003',
      material_name: 'Lactose Monohydrate',
      material_code: 'RM-LACTOSE',
      quantity_needed: 200000,
      unit: 'g',
      needed_by_date: new Date('2026-04-01'),
      reason: 'Stock replenishment',
      raised_by: supervisorId,
      status: 'PO_RAISED',
    },
  });

  // Purchase Orders
  const poAmox = await prisma.purchaseOrder.upsert({
    where: { po_number: 'PO-2026-001' },
    update: {},
    create: {
      po_number: 'PO-2026-001',
      intent_id: intentAmox.id,
      supplier_name: 'PharmaSupply Ltd',
      supplier_code: 'SUP-001',
      material_name: 'Amoxicillin Trihydrate API',
      material_code: 'RM-AMOX-API',
      quantity: 500000,
      unit: 'g',
      unit_price: 0.12,
      total_value: 60000,
      currency: 'INR',
      expected_delivery: new Date('2026-03-10'),
      status: 'FULLY_RECEIVED',
      created_by: supervisorId,
    },
  });

  const poPara = await prisma.purchaseOrder.upsert({
    where: { po_number: 'PO-2026-002' },
    update: {},
    create: {
      po_number: 'PO-2026-002',
      intent_id: intentPara.id,
      supplier_name: 'API Chemicals India',
      supplier_code: 'SUP-002',
      material_name: 'Paracetamol API',
      material_code: 'RM-PARA-API',
      quantity: 1000000,
      unit: 'g',
      unit_price: 0.05,
      total_value: 50000,
      currency: 'INR',
      expected_delivery: new Date('2026-03-12'),
      status: 'FULLY_RECEIVED',
      created_by: supervisorId,
    },
  });

  const poLactose = await prisma.purchaseOrder.upsert({
    where: { po_number: 'PO-2026-003' },
    update: {},
    create: {
      po_number: 'PO-2026-003',
      intent_id: intentLactose.id,
      supplier_name: 'Excipient Distributors',
      supplier_code: 'SUP-003',
      material_name: 'Lactose Monohydrate',
      material_code: 'RM-LACTOSE',
      quantity: 200000,
      unit: 'g',
      unit_price: 0.02,
      total_value: 4000,
      currency: 'INR',
      expected_delivery: new Date('2026-03-28'),
      status: 'PARTIALLY_RECEIVED',
      created_by: supervisorId,
    },
  });

  // 10 Material Receipts — 2 with near-expiry dates to trigger alerts
  const RECEIPTS = [
    // Normal receipts
    {
      receipt_code: 'MRN-2026-001', po_id: poAmox.id, material_id: materialMap['RM-AMOX-API'],
      received_qty: 150000, unit: 'g', received_by: supervisorId,
      supplier_batch_no: 'AMOX-SB-001', manufacture_date: new Date('2025-01-01'),
      expiry_date: new Date('2027-01-01'), qc_status: 'IN_STORES' as const,
    },
    {
      receipt_code: 'MRN-2026-002', po_id: poAmox.id, material_id: materialMap['RM-AMOX-API'],
      received_qty: 200000, unit: 'g', received_by: supervisorId,
      supplier_batch_no: 'AMOX-SB-002', manufacture_date: new Date('2025-03-01'),
      expiry_date: new Date('2027-03-01'), qc_status: 'IQC_PASSED' as const,
    },
    {
      receipt_code: 'MRN-2026-003', po_id: poAmox.id, material_id: materialMap['RM-AMOX-API'],
      received_qty: 150000, unit: 'g', received_by: supervisorId,
      supplier_batch_no: 'AMOX-SB-003', manufacture_date: new Date('2025-06-01'),
      expiry_date: new Date('2027-06-01'), qc_status: 'PENDING_IQC' as const,
    },
    {
      receipt_code: 'MRN-2026-004', po_id: poPara.id, material_id: materialMap['RM-PARA-API'],
      received_qty: 300000, unit: 'g', received_by: supervisorId,
      supplier_batch_no: 'PARA-SB-001', manufacture_date: new Date('2025-01-15'),
      expiry_date: new Date('2027-01-15'), qc_status: 'IN_STORES' as const,
    },
    {
      receipt_code: 'MRN-2026-005', po_id: poPara.id, material_id: materialMap['RM-PARA-API'],
      received_qty: 400000, unit: 'g', received_by: supervisorId,
      supplier_batch_no: 'PARA-SB-002', manufacture_date: new Date('2025-04-01'),
      expiry_date: new Date('2027-04-01'), qc_status: 'IQC_PASSED' as const,
    },
    {
      receipt_code: 'MRN-2026-006', po_id: poPara.id, material_id: materialMap['RM-PARA-API'],
      received_qty: 300000, unit: 'g', received_by: supervisorId,
      supplier_batch_no: 'PARA-SB-003', manufacture_date: new Date('2025-07-01'),
      expiry_date: new Date('2027-07-01'), qc_status: 'PENDING_IQC' as const,
    },
    {
      receipt_code: 'MRN-2026-007', po_id: poLactose.id, material_id: materialMap['RM-LACTOSE'],
      received_qty: 80000, unit: 'g', received_by: supervisorId,
      supplier_batch_no: 'LACT-SB-001', manufacture_date: new Date('2025-05-01'),
      expiry_date: new Date('2027-05-01'), qc_status: 'IQC_PASSED' as const,
    },
    {
      receipt_code: 'MRN-2026-008', po_id: poLactose.id, material_id: materialMap['RM-LACTOSE'],
      received_qty: 60000, unit: 'g', received_by: supervisorId,
      supplier_batch_no: 'LACT-SB-002', manufacture_date: new Date('2025-08-01'),
      expiry_date: new Date('2027-08-01'), qc_status: 'PENDING_IQC' as const,
    },
    // NEAR EXPIRY — triggers alerts (within 60 days from today: 2026-03-30)
    {
      receipt_code: 'MRN-2026-009', po_id: poAmox.id, material_id: materialMap['RM-AMOX-API'],
      received_qty: 5000, unit: 'g', received_by: supervisorId,
      supplier_batch_no: 'AMOX-SB-EXP-01', manufacture_date: new Date('2024-01-01'),
      expiry_date: new Date('2026-04-15'), qc_status: 'IN_STORES' as const, // ~16 days — CRITICAL
    },
    {
      receipt_code: 'MRN-2026-010', po_id: poPara.id, material_id: materialMap['RM-PARA-API'],
      received_qty: 8000, unit: 'g', received_by: supervisorId,
      supplier_batch_no: 'PARA-SB-EXP-01', manufacture_date: new Date('2024-06-01'),
      expiry_date: new Date('2026-05-20'), qc_status: 'IN_STORES' as const, // ~51 days — WARNING
    },
  ];

  const receiptMap: Record<string, string> = {};
  for (const r of RECEIPTS) {
    const receipt = await prisma.materialReceipt.upsert({
      where: { receipt_code: r.receipt_code },
      update: {},
      create: { ...r, received_at: now },
    });
    receiptMap[r.receipt_code] = receipt.id;
    console.log(`  Receipt: ${r.receipt_code} (${r.qc_status})`);
  }

  // ─── Expiry Alerts for near-expiry receipts ───────────────────────────────
  const EXPIRY_ALERTS = [
    {
      material_code: 'RM-AMOX-API', material_name: 'Amoxicillin Trihydrate API',
      receipt_id: receiptMap['MRN-2026-009'],
      expiry_date: new Date('2026-04-15'), quantity: 5000, unit: 'g',
      days_to_expiry: 16, alert_level: 'CRITICAL' as const,
    },
    {
      material_code: 'RM-PARA-API', material_name: 'Paracetamol API',
      receipt_id: receiptMap['MRN-2026-010'],
      expiry_date: new Date('2026-05-20'), quantity: 8000, unit: 'g',
      days_to_expiry: 51, alert_level: 'WARNING' as const,
    },
  ];

  for (const alert of EXPIRY_ALERTS) {
    const existing = await prisma.materialExpiryAlert.findFirst({
      where: { receipt_id: alert.receipt_id },
    });
    if (!existing) {
      await prisma.materialExpiryAlert.create({ data: alert });
      console.log(`  Expiry Alert: ${alert.material_code} — ${alert.alert_level}`);
    }
  }

  // ─── Process Flows ────────────────────────────────────────────────────────
  const PROCESS_FLOWS = [
    {
      flow_code: 'PF-CAPS-AMOX-001',
      product_code: 'AMOX-250',
      product_name: 'Amoxicillin 250mg Capsule',
      bom_id: bomMap['AMOX-250'],
      title: 'Amoxicillin Capsule Manufacturing Process Flow',
      version: '1.0',
      status: 'APPROVED' as const,
      description: 'End-to-end manufacturing process flow for Amoxicillin 250mg Hard Gelatin Capsules from raw material receipt through finished goods release.',
      baseline_metrics: { target_yield_pct: 98.5, max_cycle_time_hrs: 8, cpk_target: 1.33 },
      stages: [
        { stage_number: 1, stage_name: 'Raw Material Inward & IQC', department: 'Warehouse', responsible_role: 'SUPERVISOR', inputs: ['Purchase Order', 'CoA'], outputs: ['Released Material', 'IQC Report'], duration_min: 120, critical: true, notes: 'All materials must pass IQC before moving to stores.' },
        { stage_number: 2, stage_name: 'Dispensing', department: 'Manufacturing', responsible_role: 'BATCH_OPERATOR', inputs: ['Released Material', 'BOM'], outputs: ['Dispensed Components', 'Dispense Record'], duration_min: 60, critical: true },
        { stage_number: 3, stage_name: 'Blending', department: 'Manufacturing', responsible_role: 'BATCH_OPERATOR', inputs: ['Dispensed Components'], outputs: ['Blend', 'Blend Certificate'], duration_min: 30, critical: true },
        { stage_number: 4, stage_name: 'Capsule Filling', department: 'Manufacturing', responsible_role: 'BATCH_OPERATOR', inputs: ['Blend', 'Capsule Shells'], outputs: ['Filled Capsules', 'In-Process QC Data'], duration_min: 180, critical: true },
        { stage_number: 5, stage_name: 'Polishing & Inspection', department: 'Manufacturing', responsible_role: 'SUPERVISOR', inputs: ['Filled Capsules'], outputs: ['Inspected Capsules', 'Rejection Record'], duration_min: 135, critical: false },
        { stage_number: 6, stage_name: 'OQC & Release', department: 'QC Laboratory', responsible_role: 'QA_REVIEWER', inputs: ['Inspected Capsules', 'Batch Record'], outputs: ['CoA', 'Release Certificate'], duration_min: 240, critical: true },
      ],
    },
    {
      flow_code: 'PF-TAB-PARA-001',
      product_code: 'PARA-500',
      product_name: 'Paracetamol 500mg Tablet',
      bom_id: bomMap['PARA-500'],
      title: 'Paracetamol Tablet Manufacturing Process Flow',
      version: '1.0',
      status: 'APPROVED' as const,
      description: 'End-to-end manufacturing process flow for Paracetamol 500mg Tablets including wet granulation route.',
      baseline_metrics: { target_yield_pct: 99.0, max_cycle_time_hrs: 10, cpk_target: 1.33 },
      stages: [
        { stage_number: 1, stage_name: 'Raw Material Inward & IQC', department: 'Warehouse', responsible_role: 'SUPERVISOR', inputs: ['Purchase Order', 'CoA'], outputs: ['Released Material', 'IQC Report'], duration_min: 120, critical: true },
        { stage_number: 2, stage_name: 'Dispensing', department: 'Manufacturing', responsible_role: 'BATCH_OPERATOR', inputs: ['Released Material', 'BOM'], outputs: ['Dispensed Components'], duration_min: 60, critical: true },
        { stage_number: 3, stage_name: 'Dry Mixing', department: 'Manufacturing', responsible_role: 'BATCH_OPERATOR', inputs: ['Dispensed Components'], outputs: ['Pre-mix'], duration_min: 20, critical: false },
        { stage_number: 4, stage_name: 'Wet Granulation & Drying', department: 'Manufacturing', responsible_role: 'BATCH_OPERATOR', inputs: ['Pre-mix', 'PVP Binder Solution'], outputs: ['Dried Granules', 'Moisture Report'], duration_min: 90, critical: true },
        { stage_number: 5, stage_name: 'Tablet Compression', department: 'Manufacturing', responsible_role: 'SUPERVISOR', inputs: ['Dried Granules'], outputs: ['Compressed Tablets', 'In-Process QC Data'], duration_min: 120, critical: true },
        { stage_number: 6, stage_name: 'Visual Inspection', department: 'Manufacturing', responsible_role: 'BATCH_OPERATOR', inputs: ['Compressed Tablets'], outputs: ['Inspected Tablets', 'AQL Report'], duration_min: 60, critical: false },
        { stage_number: 7, stage_name: 'OQC & Release', department: 'QC Laboratory', responsible_role: 'QA_REVIEWER', inputs: ['Inspected Tablets', 'Batch Record'], outputs: ['CoA', 'Release Certificate'], duration_min: 240, critical: true },
      ],
    },
  ];

  for (const pf of PROCESS_FLOWS) {
    const existing = await prisma.processFlow.findUnique({ where: { flow_code: pf.flow_code } });
    let flow = existing;
    if (!existing) {
      const { stages, ...flowData } = pf;
      flow = await prisma.processFlow.create({
        data: {
          ...flowData,
          created_by: qaManagerId,
          approved_by: qaManagerId,
          approved_at: new Date(),
        },
      });
    }
    if (flow) {
      const existingStages = await prisma.processStage.findMany({ where: { flow_id: flow.id } });
      if (existingStages.length === 0) {
        for (const stage of pf.stages) {
          await prisma.processStage.create({
            data: {
              flow_id: flow.id,
              ...stage,
              decision_points: [],
            },
          });
        }
      }
      console.log(`  Process Flow: ${pf.flow_code} (${pf.product_code})`);
    }
  }

  // ─── Production Plan ──────────────────────────────────────────────────────
  const plan = await prisma.productionPlan.upsert({
    where: { plan_code: 'PP-2026-001' },
    update: {},
    create: {
      plan_code: 'PP-2026-001',
      plan_name: 'Q1 2026 Production Plan',
      plan_period: 'Q1-2026',
      status: 'APPROVED',
      created_by: supervisorId,
      approved_by: qaManagerId,
      approved_at: new Date(),
    },
  });

  const amoxBomId = bomMap['AMOX-250'];
  const paraBomId = bomMap['PARA-500'];

  const PLANNED_BATCHES = [
    {
      bom_id: amoxBomId,
      planned_batch_size: 100000,
      planned_start: new Date('2026-04-07'),
      planned_end: new Date('2026-04-07T16:00:00'),
      production_line: 'LINE-A',
      priority: 1,
      status: 'SCHEDULED' as const,
    },
    {
      bom_id: paraBomId,
      planned_batch_size: 200000,
      planned_start: new Date('2026-04-10'),
      planned_end: new Date('2026-04-10T18:00:00'),
      production_line: 'LINE-B',
      priority: 2,
      status: 'SCHEDULED' as const,
    },
    {
      bom_id: amoxBomId,
      planned_batch_size: 50000,
      planned_start: new Date('2026-04-21'),
      planned_end: new Date('2026-04-21T12:00:00'),
      production_line: 'LINE-A',
      priority: 3,
      status: 'SCHEDULED' as const,
    },
  ];

  const existingPBs = await prisma.plannedBatch.findMany({ where: { plan_id: plan.id } });
  if (existingPBs.length === 0) {
    for (const pb of PLANNED_BATCHES) {
      await prisma.plannedBatch.create({ data: { ...pb, plan_id: plan.id } });
    }
    console.log(`  Production Plan: ${plan.plan_code} with ${PLANNED_BATCHES.length} planned batches`);
  } else {
    console.log(`  Production Plan: ${plan.plan_code} (already has planned batches)`);
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
