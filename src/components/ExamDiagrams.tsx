import React from 'react';

interface ExamDiagramProps {
  unitNumber: 1 | 2 | 3 | 4 | 5;
  topicId: string;
}

export const ExamDiagram: React.FC<ExamDiagramProps> = ({ unitNumber, topicId }) => {
  if (unitNumber === 1) {
    return (
      <svg viewBox="0 0 720 260" className="w-full rounded border border-slate-200 bg-slate-50 p-2" role="img" aria-label="Von Neumann Functional Units and 3-Bus Architecture Diagram">
        <text x="360" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">
          Unit I Exam Diagram: Von Neumann Functional Units &amp; System Bus
        </text>
        {/* CPU Box */}
        <rect x="30" y="42" width="320" height="150" rx="6" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
        <text x="190" y="62" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E40AF">CPU (Central Processing Unit)</text>
        <rect x="46" y="76" width="135" height="52" rx="4" fill="#FFFFFF" stroke="#3B82F6" />
        <text x="113" y="97" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0F172A">Control Unit (CU)</text>
        <text x="113" y="114" textAnchor="middle" fontSize="9.5" fill="#475569">Fetch → Decode Signals</text>
        <rect x="199" y="76" width="135" height="52" rx="4" fill="#FFFFFF" stroke="#3B82F6" />
        <text x="266" y="97" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0F172A">ALU</text>
        <text x="266" y="114" textAnchor="middle" fontSize="9.5" fill="#475569">Add, Sub, Shift, Logic</text>
        <rect x="46" y="138" width="288" height="40" rx="4" fill="#DBEAFE" stroke="#2563EB" />
        <text x="190" y="162" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#1E3A8A">
          Registers: PC · IR · MAR · MDR · Accumulator (AC)
        </text>

        {/* System Bus */}
        <rect x="366" y="72" width="108" height="90" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
        <text x="420" y="92" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400E">SYSTEM BUS</text>
        <text x="420" y="110" textAnchor="middle" fontSize="9.5" fill="#78350F">Address Bus (→)</text>
        <text x="420" y="126" textAnchor="middle" fontSize="9.5" fill="#78350F">Data Bus (↔)</text>
        <text x="420" y="142" textAnchor="middle" fontSize="9.5" fill="#78350F">Control Bus (↔)</text>
        <line x1="350" y1="117" x2="366" y2="117" stroke="#0F172A" strokeWidth="2" />
        <line x1="474" y1="117" x2="490" y2="117" stroke="#0F172A" strokeWidth="2" />

        {/* Main Memory */}
        <rect x="490" y="42" width="200" height="150" rx="6" fill="#F0FDF4" stroke="#059669" strokeWidth="1.5" />
        <text x="590" y="62" textAnchor="middle" fontSize="12" fontWeight="700" fill="#065F46">Main Memory (RAM)</text>
        <rect x="506" y="74" width="168" height="48" rx="4" fill="#FFFFFF" stroke="#10B981" />
        <text x="590" y="96" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#0F172A">Program Instructions</text>
        <text x="590" y="111" textAnchor="middle" fontSize="9" fill="#475569">Opcodes &amp; Operands</text>
        <rect x="506" y="132" width="168" height="46" rx="4" fill="#FFFFFF" stroke="#10B981" />
        <text x="590" y="153" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#0F172A">Program Data</text>
        <text x="590" y="168" textAnchor="middle" fontSize="9" fill="#475569">Int / Float / ASCII / BCD</text>

        {/* Input / Output bar */}
        <rect x="30" y="206" width="290" height="38" rx="4" fill="#FFFFFF" stroke="#64748B" />
        <text x="175" y="229" textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">Input Unit (Keyboard, Sensor, Disk Read)</text>
        <rect x="400" y="206" width="290" height="38" rx="4" fill="#FFFFFF" stroke="#64748B" />
        <text x="545" y="229" textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">Output Unit (Display, Printer, Disk Write)</text>
      </svg>
    );
  }

  if (unitNumber === 2) {
    if (topicId === 'deco-u2-t7') {
      return (
        <svg viewBox="0 0 720 245" className="w-full rounded border border-slate-200 bg-slate-50 p-2" role="img" aria-label="Unit II 2-to-4 Binary Decoder Diagram">
          <text x="360" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">
            Unit II Exam Diagram: 2-to-4 Decoder (Minterm Generator)
          </text>
          <line x1="70" y1="80" x2="180" y2="80" stroke="#0F172A" strokeWidth="2" />
          <text x="52" y="84" fontSize="12" fontWeight="700" fill="#0F172A">A</text>
          <line x1="70" y1="130" x2="180" y2="130" stroke="#0F172A" strokeWidth="2" />
          <text x="52" y="134" fontSize="12" fontWeight="700" fill="#0F172A">B</text>
          <line x1="70" y1="180" x2="180" y2="180" stroke="#0284C7" strokeWidth="2" />
          <text x="48" y="184" fontSize="11" fontWeight="700" fill="#0284C7">Enable</text>
          <rect x="180" y="55" width="220" height="150" rx="6" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2" />
          <text x="290" y="125" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E40AF">2-to-4 Decoder</text>
          <text x="290" y="145" textAnchor="middle" fontSize="10" fill="#475569">Generates D0..D3 = m0..m3</text>
          {[0, 1, 2, 3].map((idx) => {
            const y = 74 + idx * 36;
            const expr = ["A'B' · E", "A'B · E", "AB' · E", 'AB · E'][idx];
            return (
              <g key={idx}>
                <line x1="400" y1={y} x2="510" y2={y} stroke="#059669" strokeWidth="2" />
                <text x="522" y={y + 4} fontSize="11.5" fontWeight="700" fill="#065F46">
                  D{idx} = {expr} (m{idx})
                </text>
              </g>
            );
          })}
        </svg>
      );
    }

    if (topicId === 'deco-u2-t6') {
      return (
        <svg viewBox="0 0 720 225" className="w-full rounded border border-slate-200 bg-slate-50 p-2" role="img" aria-label="Unit II 4-Bit SISO Shift Register Using D Flip-Flops">
          <text x="360" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">
            Unit II Exam Diagram: 4-Bit Serial-In Serial-Out Shift Register (D Flip-Flops)
          </text>
          <text x="26" y="96" fontSize="11" fontWeight="700" fill="#1E40AF">Serial In</text>
          <line x1="82" y1="92" x2="112" y2="92" stroke="#0F172A" strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => {
            const x = 112 + i * 145;
            return (
              <g key={i}>
                <rect x={x} y="58" width="95" height="92" rx="5" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
                <text x={x + 14} y="96" fontSize="11" fontWeight="700" fill="#0F172A">D</text>
                <text x={x + 76} y="96" fontSize="11" fontWeight="700" fill="#065F46">Q{3 - i}</text>
                <text x={x + 48} y="128" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1E40AF">FF-{i}</text>
                <polygon points={`${x},126 ${x + 10},132 ${x},138`} fill="#D97706" />
                <line x1={x - 18} y1="132" x2={x} y2="132" stroke="#D97706" strokeWidth="1.8" />
                <line x1={x - 18} y1="132" x2={x - 18} y2="182" stroke="#D97706" strokeWidth="1.8" />
                <line x1={x + 95} y1="92" x2={x + 145} y2="92" stroke="#059669" strokeWidth="2" />
              </g>
            );
          })}
          <text x="688" y="96" textAnchor="end" fontSize="11" fontWeight="700" fill="#065F46">Out</text>
          <line x1="94" y1="182" x2="548" y2="182" stroke="#D97706" strokeWidth="2" />
          <text x="320" y="204" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400E">
            Common Clock (CLK) Pulse Shifts Bits Left → Right Synchronously
          </text>
        </svg>
      );
    }

    if (topicId === 'deco-u2-t1' || topicId === 'deco-u2-t2' || topicId === 'deco-u2-t3' || topicId === 'deco-u2-t4') {
      const label =
        topicId === 'deco-u2-t1'
          ? 'Universal Gate Realization (NAND → NOT, AND, OR)'
          : topicId === 'deco-u2-t4'
          ? '3-Variable Gray-Coded K-Map (BC Columns: 00, 01, 11, 10)'
          : 'Canonical SOP (Σm Minterms) ↔ POS (ΠM Maxterms) Equivalence';
      return (
        <svg viewBox="0 0 720 230" className="w-full rounded border border-slate-200 bg-slate-50 p-2" role="img" aria-label={label}>
          <text x="360" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">
            Unit II Exam Diagram: {label}
          </text>
          {/* Left: Canonical Truth Table -> SOP / POS */}
          <rect x="28" y="48" width="210" height="156" rx="5" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
          <text x="133" y="72" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#1E40AF">Truth Table / Boolean Law</text>
          <text x="133" y="98" textAnchor="middle" fontSize="10.5" fill="#0F172A">1-Output Rows → Minterms (mᵢ)</text>
          <text x="133" y="118" textAnchor="middle" fontSize="10.5" fill="#065F46">SOP = OR of AND terms (Σm)</text>
          <line x1="48" y1="134" x2="218" y2="134" stroke="#BFDBFE" />
          <text x="133" y="156" textAnchor="middle" fontSize="10.5" fill="#0F172A">0-Output Rows → Maxterms (Mᵢ)</text>
          <text x="133" y="176" textAnchor="middle" fontSize="10.5" fill="#92400E">POS = AND of OR terms (ΠM)</text>

          <line x1="238" y1="126" x2="278" y2="126" stroke="#0F172A" strokeWidth="2" />

          {/* Right: 3-Var Gray-Coded K-Map */}
          <rect x="278" y="48" width="414" height="156" rx="5" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" />
          <text x="485" y="70" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#0F172A">
            Gray-Coded K-Map Grid (Only 1 Bit Changes Across Adjacent Cells)
          </text>
          {['00', '01', '11', '10'].map((col, ci) => (
            <text key={col} x={385 + ci * 74} y="92" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1E40AF">
              BC={col}
            </text>
          ))}
          {['A=0', 'A=1'].map((row, ri) => (
            <g key={row}>
              <text x="318" y={128 + ri * 44} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1E40AF">
                {row}
              </text>
              {[0, 1, 3, 2].map((colCode, ci) => {
                const idx = ri * 4 + colCode;
                return (
                  <g key={idx}>
                    <rect
                      x={350 + ci * 74}
                      y={104 + ri * 44}
                      width="68"
                      height="38"
                      rx="3"
                      fill={idx === 1 || idx === 2 || idx === 5 || idx === 7 ? '#DBEAFE' : '#F8FAFC'}
                      stroke="#94A3B8"
                    />
                    <text x={384 + ci * 74} y={127 + ri * 44} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#0F172A">
                      m{idx}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 720 245" className="w-full rounded border border-slate-200 bg-slate-50 p-2" role="img" aria-label="Unit II Full Adder Built From Two Half Adders Diagram">
        <text x="360" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">
          Unit II Exam Diagram: Full Adder Built From Two Half Adders + OR Gate
        </text>
        {/* Inputs A, B, Cin */}
        <text x="36" y="84" fontSize="12" fontWeight="700" fill="#0F172A">A</text>
        <line x1="52" y1="80" x2="130" y2="80" stroke="#0F172A" strokeWidth="2" />
        <text x="36" y="124" fontSize="12" fontWeight="700" fill="#0F172A">B</text>
        <line x1="52" y1="120" x2="130" y2="120" stroke="#0F172A" strokeWidth="2" />
        <text x="28" y="184" fontSize="12" fontWeight="700" fill="#0284C7">Cin</text>
        <line x1="52" y1="180" x2="290" y2="180" stroke="#0284C7" strokeWidth="2" />

        {/* HA1 */}
        <rect x="130" y="60" width="120" height="80" rx="5" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
        <text x="190" y="95" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E40AF">Half Adder 1</text>
        <text x="190" y="114" textAnchor="middle" fontSize="10" fill="#475569">S1=A⊕B, C1=A·B</text>

        {/* Wires from HA1 */}
        <line x1="250" y1="82" x2="290" y2="82" stroke="#0F172A" strokeWidth="2" />
        <line x1="250" y1="122" x2="465" y2="122" stroke="#D97706" strokeWidth="2" />

        {/* HA2 */}
        <rect x="290" y="65" width="120" height="125" rx="5" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
        <text x="350" y="122" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E40AF">Half Adder 2</text>
        <text x="350" y="140" textAnchor="middle" fontSize="10" fill="#475569">Sum = S1 ⊕ Cin</text>

        {/* Sum Out */}
        <line x1="410" y1="90" x2="620" y2="90" stroke="#059669" strokeWidth="2.5" />
        <text x="630" y="94" fontSize="12" fontWeight="700" fill="#065F46">Sum = A⊕B⊕Cin</text>

        {/* Carry Out OR Gate */}
        <line x1="410" y1="168" x2="465" y2="168" stroke="#D97706" strokeWidth="2" />
        <rect x="465" y="112" width="85" height="68" rx="18" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
        <text x="508" y="150" textAnchor="middle" fontSize="12" fontWeight="700" fill="#92400E">OR Gate</text>
        <line x1="550" y1="146" x2="620" y2="146" stroke="#D97706" strokeWidth="2.5" />
        <text x="626" y="150" fontSize="11.5" fontWeight="700" fill="#92400E">Cout = C1 + C2</text>
      </svg>
    );
  }

  if (unitNumber === 3) {
    return (
      <svg viewBox="0 0 720 235" className="w-full rounded border border-slate-200 bg-slate-50 p-2" role="img" aria-label="Unit III Microprogrammed Control Address Sequencer Diagram">
        <text x="360" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">
          Unit III Exam Diagram: Microprogrammed Control &amp; Arithmetic Registers (M, A, Q)
        </text>
        <rect x="40" y="50" width="140" height="58" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" />
        <text x="110" y="75" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F172A">IR Opcode Mapping</text>
        <text x="110" y="93" textAnchor="middle" fontSize="9.5" fill="#475569">&amp; Status Flags</text>

        <line x1="180" y1="79" x2="220" y2="79" stroke="#0F172A" strokeWidth="2" />
        <rect x="220" y="48" width="120" height="62" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
        <text x="280" y="74" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400E">Next-Address</text>
        <text x="280" y="92" textAnchor="middle" fontSize="10" fill="#78350F">MUX &amp; SBR Stack</text>

        <line x1="340" y1="79" x2="380" y2="79" stroke="#0F172A" strokeWidth="2" />
        <rect x="380" y="56" width="90" height="46" rx="4" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
        <text x="425" y="83" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E40AF">CAR</text>

        <line x1="470" y1="79" x2="510" y2="79" stroke="#0F172A" strokeWidth="2" />
        <rect x="510" y="46" width="170" height="72" rx="5" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
        <text x="595" y="72" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#065F46">Control Memory (ROM)</text>
        <text x="595" y="90" textAnchor="middle" fontSize="9.5" fill="#047857">Microinstructions + Control Word</text>

        {/* Bottom Arithmetic Datapath */}
        <rect x="40" y="146" width="640" height="68" rx="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <text x="360" y="168" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#0F172A">
          Computer Arithmetic Hardware: Shift-and-Add / Booth / Restoring &amp; Non-Restoring Division
        </text>
        <text x="360" y="192" textAnchor="middle" fontSize="10.5" fill="#334155">
          [ Register A (Accumulator / Remainder) ]  ↔  [ Parallel Adder/Subtractor ± M ]  ↔  [ Register Q (Multiplier / Quotient) ]
        </text>
      </svg>
    );
  }

  if (unitNumber === 4) {
    return (
      <svg viewBox="0 0 720 245" className="w-full rounded border border-slate-200 bg-slate-50 p-2" role="img" aria-label="Unit IV DMA Controller and Memory Hierarchy Diagram">
        <text x="360" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">
          Unit IV Exam Diagram: DMA Bus Control (HOLD/HLDA) &amp; Memory Hierarchy
        </text>
        {/* Left: DMA Diagram */}
        <rect x="26" y="45" width="105" height="58" rx="4" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
        <text x="78" y="70" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#1E40AF">CPU</text>
        <text x="78" y="88" textAnchor="middle" fontSize="9.5" fill="#475569">Tri-states bus</text>

        <rect x="165" y="45" width="130" height="58" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
        <text x="230" y="68" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400E">DMA Controller</text>
        <text x="230" y="85" textAnchor="middle" fontSize="9" fill="#78350F">Addr · Count · Ctrl</text>

        <line x1="131" y1="62" x2="165" y2="62" stroke="#D97706" strokeWidth="1.8" />
        <text x="148" y="57" textAnchor="middle" fontSize="8" fontWeight="700" fill="#92400E">BG/HLDA</text>
        <line x1="131" y1="84" x2="165" y2="84" stroke="#DC2626" strokeWidth="1.8" />
        <text x="148" y="98" textAnchor="middle" fontSize="8" fontWeight="700" fill="#B91C1C">BR/HOLD</text>

        <rect x="330" y="45" width="110" height="58" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
        <text x="385" y="70" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#065F46">Main RAM</text>
        <text x="385" y="88" textAnchor="middle" fontSize="9.5" fill="#047857">Direct Transfer</text>

        <line x1="26" y1="130" x2="440" y2="130" stroke="#0F172A" strokeWidth="3" />
        <text x="230" y="148" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0F172A">
          System Bus (Address · Data · Read/Write Control)
        </text>
        <line x1="78" y1="103" x2="78" y2="130" stroke="#0F172A" strokeWidth="2" />
        <line x1="230" y1="103" x2="230" y2="130" stroke="#0F172A" strokeWidth="2" />
        <line x1="385" y1="103" x2="385" y2="130" stroke="#0F172A" strokeWidth="2" />

        <rect x="130" y="170" width="200" height="44" rx="4" fill="#FFFFFF" stroke="#64748B" />
        <text x="230" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">Disk / Network Peripheral ↔ DMAC</text>

        {/* Right: Memory Pyramid */}
        <polygon points="585,48 480,215 690,215" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
        <line x1="559" y1="90" x2="611" y2="90" stroke="#93C5FD" />
        <line x1="533" y1="132" x2="637" y2="132" stroke="#93C5FD" />
        <line x1="507" y1="174" x2="663" y2="174" stroke="#93C5FD" />
        <text x="585" y="79" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1E3A8A">Registers</text>
        <text x="585" y="117" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1E40AF">Cache (SRAM)</text>
        <text x="585" y="158" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1E40AF">Main RAM (DRAM)</text>
        <text x="585" y="200" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0F172A">SSD / Magnetic Disk</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 220" className="w-full rounded border border-slate-200 bg-slate-50 p-2" role="img" aria-label="Unit V 5-Stage Pipelined Datapath and Forwarding Diagram">
      <text x="360" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">
        Unit V Exam Diagram: 5-Stage RISC Pipelined Datapath (IF → ID → EX → MEM → WB)
      </text>
      {['IF\nFetch', 'ID\nDecode', 'EX\nALU', 'MEM\nMemory', 'WB\nWrite'].map((stage, i) => {
        const x = 35 + i * 138;
        const [code, desc] = stage.split('\n');
        return (
          <g key={code}>
            <rect x={x} y="62" width="96" height="72" rx="5" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
            <text x={x + 48} y="92" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E40AF">{code}</text>
            <text x={x + 48} y="112" textAnchor="middle" fontSize="10" fill="#475569">{desc}</text>
            {i < 4 && (
              <>
                <rect x={x + 104} y="54" width="24" height="88" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
                <text x={x + 116} y="102" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#92400E" transform={`rotate(-90 ${x + 116} 102)`}>
                  {['IF/ID', 'ID/EX', 'EX/MEM', 'MEM/WB'][i]}
                </text>
              </>
            )}
          </g>
        );
      })}
      {/* Forwarding bypass arc */}
      <path d="M 432 142 L 432 182 L 359 182 L 359 138" fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="5,3" />
      <text x="360" y="198" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#059669">
        Operand Forwarding Path (EX/MEM → EX Input MUX eliminates RAW Stalls!)
      </text>
    </svg>
  );
};
