import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  ReactFlowProvider,
  useNodesState, 
  useEdgesState, 
  useReactFlow,
  Background, 
  Panel,
  Controls,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import './VisualizationPage.css';

// --- 数据定义 ---

const initialCompactNodes = [
  { id: 'x', type: 'input', data: { label: '输入\nxt' }, position: { x: 0, y: 150 } },
  { id: 'h_compact', data: { label: 'RNN单元\nh(t) = f(h(t-1), xt)' }, position: { x: 200, y: 150 } },
  { id: 'y', type: 'output', data: { label: '输出\nyt' }, position: { x: 400, y: 150 } },
];
const initialCompactEdges = [
  { id: 'x-h', source: 'x', target: 'h_compact', label: 'W_xh' },
  { id: 'h-h', source: 'h_compact', target: 'h_compact', type: 'smoothstep', label: 'W_hh' },
  { id: 'h-y', source: 'h_compact', target: 'y', label: 'W_hy' },
];

const initialExpandedNodes = [
  { id: 'x1', type: 'input', data: { label: '输入\nx(t=1)' }, position: { x: 0, y: 200 } },
  { id: 'h1', data: { label: '隐藏态\nh(t=1)' }, position: { x: 200, y: 200 } },
  { id: 'y1', type: 'output', data: { label: '输出\ny(t=1)' }, position: { x: 200, y: 400 } },
  { id: 'x2', type: 'input', data: { label: '输入\nx(t=2)' }, position: { x: 400, y: 200 } },
  { id: 'h2', data: { label: '隐藏态\nh(t=2)' }, position: { x: 600, y: 200 } },
  { id: 'y2', type: 'output', data: { label: '输出\ny(t=2)' }, position: { x: 600, y: 400 } },
  { id: 'x3', type: 'input', data: { label: '输入\nx(t=3)' }, position: { x: 800, y: 200 } },
  { id: 'h3', data: { label: '隐藏态\nh(t=3)' }, position: { x: 1000, y: 200 } },
  { id: 'y3', type: 'output', data: { label: '输出\ny(t=3)' }, position: { x: 1000, y: 400 } },
  { id: 'h0', data: { label: '初始隐藏态\nh(t=0)' }, position: { x: -50, y: 50 } },
];
const initialExpandedEdges = [
  { id: 'x1-h1', source: 'x1', target: 'h1', label: 'W_xh' }, { id: 'h1-y1', source: 'h1', target: 'y1', label: 'W_hy' },
  { id: 'h0-h1', source: 'h0', target: 'h1', label: 'h(0)' },  { id: 'x2-h2', source: 'x2', target: 'h2', label: 'W_xh' },
  { id: 'h1-h2', source: 'h1', target: 'h2', label: 'W_hh' },  { id: 'h2-y2', source: 'h2', target: 'y2', label: 'W_hy' },
  { id: 'x3-h3', source: 'x3', target: 'h3', label: 'W_xh' },  { id: 'h2-h3', source: 'h2', target: 'h3', label: 'W_hh' },
  { id: 'h3-y3', source: 'h3', target: 'y3', label: 'W_hy' },
];

const animationSteps = [
    { step: 1, explanation: 't=1，h(0)和x(1)进入RNN单元', activeNodes: ['h0', 'x1'], activeEdges: ['h0-h1', 'x1-h1'] },
    { step: 2, explanation: '计算新隐藏态h(1)', activeNodes: ['h1'], activeEdges: ['h0-h1', 'x1-h1'] },
    { step: 3, explanation: 'h(1)计算输出y(1)', activeNodes: ['y1'], activeEdges: ['h1-y1'] },
    { step: 4, explanation: 't=2，h(1)和x(2)进入RNN单元', activeNodes: ['h1', 'x2'], activeEdges: ['h1-h2', 'x2-h2'] },
    { step: 5, explanation: '计算新隐藏态h(2)', activeNodes: ['h2'], activeEdges: ['h1-h2', 'x2-h2'] },
    { step: 6, explanation: 'h(2)计算输出y(2)', activeNodes: ['y2'], activeEdges: ['h2-y2'] },
    { step: 7, explanation: 't=3，h(2)和x(3)进入RNN单元', activeNodes: ['h2', 'x3'], activeEdges: ['h2-h3', 'x3-h3'] },
    { step: 8, explanation: '计算最终隐藏态h(3)', activeNodes: ['h3'], activeEdges: ['h2-h3', 'x3-h3'] },
    { step: 9, explanation: 'h(3)计算最终输出y(3)。动画结束', activeNodes: ['y3'], activeEdges: ['h3-y3'] },
];

const VisualizationComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialCompactNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialCompactEdges);
  const { fitView } = useReactFlow();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [explanationText, setExplanationText] = useState("点击“展开视图”按钮，查看RNN按时间步展开的结构。");

  const resetAnimation = useCallback(() => {
    setCurrentStep(0);
    setExplanationText("动画已重置。点击“下一步”重新开始。");
    setNodes(nds => nds.map(n => ({ ...n, className: '' })));
    setEdges(egs => egs.map(e => ({ ...e, animated: false, className: '' })));
  }, [setNodes, setEdges]);

  const handleExpandCollapse = useCallback(() => {
    setIsExpanded((prev) => {
      const nextIsExpanded = !prev;
      setNodes(nextIsExpanded ? initialExpandedNodes : initialCompactNodes);
      setEdges(nextIsExpanded ? initialExpandedEdges : initialCompactEdges);
      resetAnimation();
      setTimeout(() => fitView({ padding: 0.1, duration: 800 }), 100);
      return nextIsExpanded;
    });
  }, [resetAnimation, setNodes, setEdges, fitView]);

  const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, animationSteps.length));
  const handlePrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const handleJumpToStep = (e) => setCurrentStep(parseInt(e.target.value, 10));

  useEffect(() => {
    if (!isExpanded) {
        setExplanationText("这是RNN的紧凑（循环）视图。请先“展开视图”再开始动画。");
        setEdges(initialCompactEdges.map(e => ({...e, animated: e.id === 'h-h'})));
        return;
    };
    if (currentStep === 0) {
        setExplanationText("RNN已按时间步展开。点击“下一步”开始观看数据流动。");
        setNodes(initialExpandedNodes.map(n => ({ ...n, className: '' })));
        setEdges(initialExpandedEdges.map(e => ({ ...e, animated: false, className: '' })));
        return;
    }
    const stepData = animationSteps.find(s => s.step === currentStep);
    if (stepData) {
        setExplanationText(stepData.explanation);
        const activeNodeIds = new Set(stepData.activeNodes);
        const activeEdgeIds = new Set(stepData.activeEdges);
        setNodes(nds => nds.map(node => ({ ...node, className: activeNodeIds.has(node.id) ? 'node-active' : 'node-faded' })));
        setEdges(egs => egs.map(edge => ({ ...edge, animated: activeEdgeIds.has(edge.id), className: activeEdgeIds.has(edge.id) ? 'edge-active' : 'edge-faded' })));
    }
  }, [currentStep, isExpanded, setNodes, setEdges]);

  return (
    <div className="main-panel">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} proOptions={{ hideAttribution: true }} fitView>
          <Panel position="top-left" className="header" style={{ top: 80 }}><h1>RNN 可视化教学平台</h1></Panel>
          <Panel position="top-center" className="controls" style={{ top: 80 }}>
            <button onClick={handleExpandCollapse}>{isExpanded ? '折叠视图' : '展开视图'}</button>
            <button onClick={handlePrevStep} disabled={!isExpanded || currentStep === 0}>上一步</button>
            <button onClick={handleNextStep} disabled={!isExpanded || currentStep >= animationSteps.length}>下一步</button>
            <select className="step-jumper" value={currentStep} onChange={handleJumpToStep} disabled={!isExpanded}>
              <option value={0}>知识点直达...</option>
              {animationSteps.map(s => <option key={s.step} value={s.step}>{`第${s.step}步: ${s.explanation}`}</option>)}
            </select>
            <button onClick={resetAnimation} disabled={!isExpanded}>一键重置</button>
          </Panel>
          <Panel position="bottom-center" className="explanation-box"><p>{`步骤 ${currentStep > 0 ? currentStep: '—'}: ${explanationText}`}</p></Panel>
          <Background variant="dots" gap={24} size={1} />
          <Controls showInteractive={false} />
          <MiniMap nodeColor={(n) => {
              const type = n.type || 'default';
              if (type === 'input') return '#0288d1';
              if (type === 'output') return '#7b1fa2';
              return '#d32f2f';
          }} />
        </ReactFlow>
    </div>
  );
};

const VisualizationPage = () => (<div className="container"><ReactFlowProvider><VisualizationComponent /></ReactFlowProvider></div>);
export default VisualizationPage;
