import React, { useMemo, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import './Rnn3dModel.css';

// --- Configuration ---
const config = {
  timeSteps: 3, inputSize: 3, hiddenSize: 10, outputSize: 2,
  timeStepSpacing: 4.5, layerSpacing: 4, neuronSpacing: 0.5, neuronSize: 0.18,
  edgeColor: 'rgba(255, 255, 255, 0.25)',
  colors: { input: '#ff6b6b', hidden: '#4dabf7', output: '#a9e34b' },
};

// --- Guide Steps ---
const guideSteps = [
    { explanation: "这是一个按时间步展开的RNN。粉色是输入层，蓝色是隐藏层，绿色是输出层。", highlight: () => true },
    { explanation: "在 t-1 时刻，序列的第一个输入 (Xt-1) 进入网络。", highlight: (node) => node.t === 0 },
    { explanation: "信号传递到隐藏层，计算出第一个隐藏状态 (Ht-1)。", highlight: (node) => node.t === 0 && (node.type === 'input' || node.type === 'hidden') },
    { explanation: "在 t 时刻，新的输入 (Xt) 与前一个隐藏状态 (Ht-1) 结合，共同影响新的隐藏状态 (Ht)。", highlight: (node) => node.id.includes('_1_') || node.id.startsWith('h_0_') },
    { explanation: "这个“循环连接”是RNN的核心，它使得网络能够“记忆”之前的信息。", highlight: (node) => node.type === 'hidden' },
    { explanation: "最终，在每个时间步，隐藏层都会产生一个输出。探索完成！", highlight: () => true },
];

// --- Reusable Components ---
const Neuron = ({ position, color, highlighted }) => (
  <Sphere position={position} args={[config.neuronSize, 16, 16]}>
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={highlighted ? 0.5 : 0} transparent opacity={highlighted ? 1 : 0.15} />
  </Sphere>
);
const Edge = ({ from, to, highlighted }) => <Line points={[from, to]} color={config.edgeColor} lineWidth={0.5} transparent opacity={highlighted ? 0.25 : 0.05} />;
const TimeStepLabel = ({...props}) => <Text fontSize={1.2} color="white" anchorX="left" anchorY="middle" {...props} />;

// --- Main Structure ---
function RnnStructure({ currentStep }) {
  const { nodes, edges } = useMemo(() => {
    const nodes = [], edges = [], nodeMap = new Map();
    const getZ = (size, i) => i * config.neuronSpacing - (size - 1) * config.neuronSpacing / 2;
    for (let t = 0; t < config.timeSteps; t++) {
      const y = -t * config.timeStepSpacing + (config.timeSteps - 1) * config.timeStepSpacing / 2;
      const inputX = -config.layerSpacing, hiddenX = 0, outputX = config.layerSpacing;
      for (let i = 0; i < config.inputSize; i++) { const n = { id: `x_${t}_${i}`, t, pos: [inputX, y, getZ(config.inputSize, i)], type: 'input' }; nodes.push(n); nodeMap.set(n.id, n); }
      for (let i = 0; i < config.hiddenSize; i++) { const n = { id: `h_${t}_${i}`, t, pos: [hiddenX, y, getZ(config.hiddenSize, i)], type: 'hidden' }; nodes.push(n); nodeMap.set(n.id, n); }
      for (let i = 0; i < config.outputSize; i++) { const n = { id: `y_${t}_${i}`, t, pos: [outputX, y, getZ(config.outputSize, i)], type: 'output' }; nodes.push(n); nodeMap.set(n.id, n); }
      for (let i = 0; i < config.inputSize; i++) for (let j = 0; j < config.hiddenSize; j++) edges.push({ from: `x_${t}_${i}`, to: `h_${t}_${j}` });
      for (let i = 0; i < config.hiddenSize; i++) for (let j = 0; j < config.outputSize; j++) edges.push({ from: `h_${t}_${i}`, to: `y_${t}_${j}` });
      if (t > 0) for (let i = 0; i < config.hiddenSize; i++) for (let j = 0; j < config.hiddenSize; j++) edges.push({ from: `h_${t - 1}_${i}`, to: `h_${t}_${j}` });
    }
    return { nodes, edges, nodeMap };
  }, []);

  const stepLogic = guideSteps[currentStep];

  return (
    <group>
      {nodes.map(node => <Neuron key={node.id} position={node.pos} color={config.colors[node.type]} highlighted={stepLogic.highlight(node)} />)}
      {edges.map((edge, i) => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        if(!fromNode || !toNode) return null;
        return <Edge key={i} from={fromNode.pos} to={toNode.pos} highlighted={stepLogic.highlight(fromNode) && stepLogic.highlight(toNode)} />;
      })}
      
      {Array.from({ length: config.timeSteps }).map((_, t) => (
        <TimeStepLabel
          key={t}
          text={`Xt${t === 0 ? '-1' : (t === 1 ? '' : `+${t-1}`)}`}
          position={[-config.layerSpacing - 3, -t * config.timeStepSpacing + (config.timeSteps - 1) * config.timeStepSpacing / 2, 0]}
        />
      ))}
    </group>
  );
}

// --- Main Export ---
export default function Rnn3dModel() {
  const [currentStep, setCurrentStep] = useState(0);
  const nextStep = () => setCurrentStep(prev => (prev + 1) % guideSteps.length);

  return (
    <div className="rnn-3d-container">
      <div className="rnn-3d-canvas-wrapper">
        <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 30]} intensity={1.5} />
          <Suspense fallback={null}>
            <RnnStructure currentStep={currentStep} />
          </Suspense>
          <OrbitControls enableZoom={true} enablePan={true} minDistance={5} maxDistance={40} />
        </Canvas>
      </div>
      <div className="rnn-3d-controls">
        <p className="explanation-text">{guideSteps[currentStep].explanation}</p>
        <button onClick={nextStep} className="control-button">
          {currentStep === guideSteps.length - 1 ? '重新开始' : '下一步'}
        </button>
      </div>
    </div>
  );
}
