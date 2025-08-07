import React, { useState, useEffect, useRef } from 'react';
import { DndContext, useDraggable, useDroppable, closestCenter } from '@dnd-kit/core';
import './ComparativeAnalysis.css';
import { FaBrain, FaSyncAlt, FaUnlink, FaRocket, FaProjectDiagram, FaSlidersH, FaTimes, FaLightbulb } from 'react-icons/fa';

// --- Placeholder Audio Files ---
// You can replace these with your actual audio file paths
const SOUND_CORRECT_PATH = '/sounds/correct.mp3';
const SOUND_INCORRECT_PATH = '/sounds/incorrect.mp3';
const SOUND_VICTORY_PATH = '/sounds/victory.mp3';

const knowledgeCards = [
  { icon: <FaBrain />, title: '什么是 RNN?', content: '循环神经网络 (Recurrent Neural Network) 是一种专门处理序列数据的神经网络。它通过内部的“循环”结构，让信息可以在网络中持续存在，从而拥有了处理时间序列、文本等变长输入的“记忆”能力。'},
  { icon: <FaSyncAlt />, title: '核心概念：隐藏状态 (Hidden State)', content: '隐藏状态是RNN的记忆核心。在每个时间步，RNN都会根据当前输入和前一时刻的隐藏状态，计算出新的隐藏状态。这个新状态既包含了当前的信息，也浓缩了过去的信息。'},
  { icon: <FaUnlink />, title: '关键问题：长期依赖 (Long-Term Dependencies)', content: '当序列很长时，RNN很难将早期的重要信息一直传递到最后，这被称为“长期依赖”问题。主要是因为在反向传播过程中，梯度可能会变得非常小（梯度消失）或非常大（梯度爆炸），导致模型难以训练。'},
  { icon: <FaRocket />, title: 'RNN的广泛应用 (Applications)', content: '由于其强大的序列处理能力，RNN被广泛应用于自然语言处理（机器翻译、情感分析、文本生成）、语音识别、时间序列预测（股票价格、天气预报）等多个重要领域。'},
  { icon: <FaProjectDiagram />, title: '重要变体 (Variants)', content: '为了解决RNN的局限性，研究人员提出了多种变体。除LSTM外，还有门控循环单元(GRU)——作为LSTM的流行简化版，以及双向RNN(Bi-RNN)——能同时从过去和未来两个方向学习信息。'},
  { icon: <FaSlidersH />, title: '训练挑战 (Training Challenges)', content: '训练RNN通常使用“沿时间反向传播”(BPTT)算法。除了梯度消失/爆炸问题外，RNN的训练也可能面临计算成本高、收敛速度慢等挑战，需要仔细的超参数调整。'},
];

const RnnUnit = ({ onHover }) => ( <div className="unit-diagram rnn-unit" onMouseLeave={() => onHover(null)}><span className="flow-label top">数据流</span><div className="rnn-core" onMouseEnter={() => onHover('tanh')}>tanh</div></div> );
const LstmUnit = ({ onHover }) => ( <div className="unit-diagram lstm-unit" onMouseLeave={() => onHover(null)}><span className="flow-label top">数据流</span><div className="gate forget-gate" onMouseEnter={() => onHover('forget')}>遗忘门</div><div className="gate-group"><div className="gate input-gate" onMouseEnter={() => onHover('input')}>输入门</div><div className="cell-state" onMouseEnter={() => onHover('cell')}>细胞状态 (Cell State)</div><div className="gate output-gate" onMouseEnter={() => onHover('output')}>输出门</div></div><span className="flow-label bottom">隐藏状态 (Ht)</span></div> );
const CnnUnit = ({ onHover }) => ( <div className="unit-diagram cnn-unit" onMouseLeave={() => onHover(null)}><div className="cnn-layer conv-layer" onMouseEnter={() => onHover('conv')}>卷积层 (Conv)</div><div className="cnn-layer relu-layer" onMouseEnter={() => onHover('relu')}>激活层 (ReLU)</div><div className="cnn-layer pool-layer" onMouseEnter={() => onHover('pool')}>池化层 (Pool)</div></div> );

const componentExplanations = {
    // RNN
    tanh: "【Tanh 激活】作为RNN的核心，Tanh函数将输入和前一时刻的状态压缩到-1到1之间。它的非线性特性使得RNN能够学习复杂模式，但它也可能导致梯度在长序列中消失。",
    // LSTM
    forget: "【遗忘门】决定从细胞状态中丢弃哪些旧信息。它通过一个sigmoid函数，根据当前输入和前一状态，为过去的信息赋予一个0到1的权重，1代表“完全保留”，0代表“完全遗忘”。",
    input: "【输入门】决定让哪些新信息存储到细胞状态中。它包含两部分：一个sigmoid层决定更新哪些值，一个tanh层创建一个新的候选值向量，两者相乘后更新到细胞状态。",
    output: "【输出门】决定从（经过tanh过滤的）细胞状态中输出什么信息。一个sigmoid函数决定哪些部分可以输出，从而生成该时间步的隐藏状态。",
    cell: "【细胞状态】这是LSTM的记忆核心，像一条传送带。信息可以在上面直接流过，只有“门”结构可以精细地向其添加或移除信息，这使得LSTM能够有效解决长期依赖问题。",
    // CNN
    conv: "【卷积层】CNN的基石。它使用可学习的滤波器（或称卷积核）在输入数据上滑动，以检测特定的局部特征，如图像中的边缘、角点或纹理。",
    relu: "【ReLU激活层】全称为“修正线性单元”。它为模型引入非线性，将所有负值激活变为零，而正值保持不变。这大大加快了训练速度，并有助于缓解梯度消失问题。",
    pool: "【池化层】通常在卷积层之后，用于对特征图进行降维。它通过取一个小区域内的最大值（Max Pooling）或平均值（Average Pooling）来减少数据量、计算复杂度和控制过拟合。",
    default: "将鼠标悬停在任一模型单元的不同部分上，查看其功能解析。",
};

const initialComponents = [
    { id: 'comp-1', name: 'tanh激活', model: 'RNN' }, { id: 'comp-2', name: '输入门', model: 'LSTM' },
    { id: 'comp-3', name: '遗忘门', model: 'LSTM' }, { id: 'comp-4', name: '输出门', model: 'LSTM' },
    { id: 'comp-5', name: '细胞状态', model: 'LSTM' }, { id: 'comp-6', name: '卷积层', model: 'CNN' },
    { id: 'comp-7', name: '池化层', model: 'CNN' }, { id: 'comp-8', name: 'ReLU激活', model: 'CNN' },
];

const builderExplanations = {
    rnn: "【RNN解析】结构简单是RNN的最大特点。您搭建的RNN单元仅用一个 **tanh激活函数** 作为核心，直接处理并循环传递信息。这使其轻快高效，但也难以处理长期依赖问题。",
    lstm: "【LSTM解析】精密控制是LSTM的精髓！您搭建的单元通过 **遗忘门** 决定抛弃旧信息，**输入门** 选择性记录新信息，并将这一切保存在独立的 **细胞状态** 中，最后由 **输出门** 决定输出什么。这个精巧的门控机制是它能够处理长序列的关键！",
    cnn: "【CNN解析】与序列模型不同，CNN是模式识别的专家。您搭建的单元依靠 **卷积层** 来提取局部特征（如图像的边缘），通过 **ReLU激活** 增加非线性，再用 **池化层** 进行降维和特征增强。",
    error: "部分组件放置错误，请仔细检查每个搭建区中的零件是否正确，以及数量是否匹配。",
    default: "完成模型搭建并点击“完成搭建”按钮后，这里将显示对该模型内部工作流的解析。",
};

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

function DraggableComponent({ component, containerId, isHinted }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: component.id, data: { component, from: containerId } });
    const style = { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, zIndex: isDragging ? 1000 : undefined, cursor: isDragging ? 'grabbing' : 'grab' };
    
    if (containerId !== 'pool') {
        const colorClass = { '输入门': 'input-gate', '遗忘门': 'forget-gate', '输出门': 'output-gate', '细胞状态': 'cell-state', 'tanh激活': 'rnn-core-style', '卷积层': 'cnn-conv', '池化层': 'cnn-pool', 'ReLU激活': 'cnn-relu' }[component.name] || '';
        return <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`styled-component ${colorClass} ${isHinted ? 'hint' : ''}`}>{component.name}</div>;
    }
    return <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`draggable-component ${isHinted ? 'hint' : ''}`}>{component.name}</div>;
};

function DroppableZone({ id, title, items, validationStatus, isHinted }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const status = validationStatus[id];
    const placeholdersCount = { rnn: 1, lstm: 4, cnn: 3 };

    return (
        <div ref={setNodeRef} className={`droppable-zone ${status === true ? 'correct' : status === false ? 'incorrect' : ''} ${isOver ? 'over' : ''} ${id === 'pool' ? 'pool-zone' : ''} ${isHinted ? 'hint' : ''}`}>
            {id !== 'pool' && <h4>{title}</h4>}
            {id === 'pool' && items.length === 0 && <div className="pool-watermark">零件池</div>}
            <div className={`component-list ${id === 'pool' ? 'pool-list' : ''}`}>
                {items.map(comp => <DraggableComponent key={comp.id} component={comp} containerId={id} isHinted={isHinted && isHinted.componentId === comp.id} />)}
                {id !== 'pool' && Array.from({ length: Math.max(0, (placeholdersCount[id] || 0) - items.length) }).map((_, i) => <div key={`ph-${id}-${i}`} className="component-placeholder" />)}
            </div>
        </div>
    );
};

function ComparativeAnalysis() {
    const [explanation, setExplanation] = useState(componentExplanations.default);
    const [containers, setContainers] = useState(() => ({ pool: shuffleArray([...initialComponents]), rnn: [], lstm: [], cnn: [] }));
    const [validationStatus, setValidationStatus] = useState({ rnn: null, lstm: null, cnn: null });
    const [builderExplanation, setBuilderExplanation] = useState(builderExplanations.default);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // --- Game Mode State ---
    const [challengeStarted, setChallengeStarted] = useState(false);
    const [isChallengeActive, setIsChallengeActive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [hintTarget, setHintTarget] = useState(null);
    const startTimeRef = useRef(0);

    // --- Audio Refs ---
    const correctSound = useRef(typeof Audio !== 'undefined' ? new Audio(SOUND_CORRECT_PATH) : null);
    const incorrectSound = useRef(typeof Audio !== 'undefined' ? new Audio(SOUND_INCORRECT_PATH) : null);
    const victorySound = useRef(typeof Audio !== 'undefined' ? new Audio(SOUND_VICTORY_PATH) : null);

    // --- Timer Effect ---
    useEffect(() => {
        let interval;
        if (isChallengeActive) {
            startTimeRef.current = Date.now() - elapsedTime;
            interval = setInterval(() => {
                setElapsedTime(Date.now() - startTimeRef.current);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isChallengeActive]);

    const findContainer = (id) => {
        if (id === 'pool' || (containers.pool?.some(item => item.id === id))) return 'pool';
        if (id === 'rnn' || (containers.rnn?.some(item => item.id === id))) return 'rnn';
        if (id === 'lstm' || (containers.lstm?.some(item => item.id === id))) return 'lstm';
        if (id === 'cnn' || (containers.cnn?.some(item => item.id === id))) return 'cnn';
        return null;
    };
    
    const handleDragEnd = (event) => {
        const { over, active } = event;
        if (!over) return;
    
        const sourceContainer = active.data.current.from;
        const destContainer = findContainer(over.id);
        const component = active.data.current.component;
    
        if (!destContainer || sourceContainer === destContainer) return;

        // Play sound based on correctness
        const isCorrectMove = component.model.toLowerCase() === destContainer;
        if (isCorrectMove) correctSound.current?.play(); else incorrectSound.current?.play();
    
        setContainers(prev => {
            const sourceItems = prev[sourceContainer].filter(item => item.id !== component.id);
            const destItems = [...prev[destContainer], component];
            return { ...prev, [sourceContainer]: sourceItems, [destContainer]: destItems };
        });
    };

    const handleValidate = () => {
        const getCorrectCount = (model) => initialComponents.filter(c => c.model === model).length;
        const rnnCorrect = containers.rnn.length === getCorrectCount('RNN') && containers.rnn.every(c => c.model === 'RNN');
        const lstmCorrect = containers.lstm.length === getCorrectCount('LSTM') && containers.lstm.every(c => c.model === 'LSTM');
        const cnnCorrect = containers.cnn.length === getCorrectCount('CNN') && containers.cnn.every(c => c.model === 'CNN');
        const newStatus = { rnn: containers.rnn.length > 0 ? rnnCorrect : null, lstm: containers.lstm.length > 0 ? lstmCorrect : null, cnn: containers.cnn.length > 0 ? cnnCorrect : null };
        setValidationStatus(newStatus);

        let newExplanation = [ newStatus.rnn && builderExplanations.rnn, newStatus.lstm && builderExplanations.lstm, newStatus.cnn && builderExplanations.cnn ].filter(Boolean).join("\n\n");
        if (newExplanation) setBuilderExplanation(newExplanation);
        else if (containers.rnn.length || containers.lstm.length || containers.cnn.length) setBuilderExplanation(builderExplanations.error);
        else setBuilderExplanation(builderExplanations.default);

        if (rnnCorrect && lstmCorrect && cnnCorrect) {
            setIsChallengeActive(false);
            setShowSuccessModal(true);
            victorySound.current?.play();
        }
    };

    const handleReset = () => {
        setContainers({ pool: shuffleArray([...initialComponents]), rnn: [], lstm: [], cnn: [] });
        setValidationStatus({ rnn: null, lstm: null, cnn: null });
        setBuilderExplanation(builderExplanations.default);
        setShowSuccessModal(false);
        setChallengeStarted(false);
        setIsChallengeActive(false);
        setElapsedTime(0);
        setHintTarget(null);
    };

    const handleStartChallenge = () => {
        handleReset();
        setChallengeStarted(true);
        setIsChallengeActive(true);
    };

    const handleGiveHint = () => {
        const misplaced = [];
        initialComponents.forEach(comp => {
            const correctContainer = comp.model.toLowerCase();
            const currentContainer = findContainer(comp.id);
            if (currentContainer !== correctContainer) {
                misplaced.push({ componentId: comp.id, containerId: correctContainer });
            }
        });

        if (misplaced.length > 0) {
            const randomHint = misplaced[Math.floor(Math.random() * misplaced.length)];
            setHintTarget(randomHint);
            setTimeout(() => setHintTarget(null), 1500); // Highlight for 1.5s
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <div className="ca-container">
                {showSuccessModal && (
                    <div className="success-modal-overlay">
                        <div className="success-modal-content">
                            <button className="close-modal-btn" onClick={() => setShowSuccessModal(false)}><FaTimes /></button>
                            <h2>太棒了！</h2>
                            <h3>你已成功搭建所有神经网络单元！</h3>
                            {elapsedTime > 0 && <div className="final-time">用时：<span>{(elapsedTime / 1000).toFixed(2)}</span> 秒</div>}
                            <div className="final-summary">
                                <p><strong>RNN - 简约之美:</strong> 依赖单一核心循环记忆，轻快但健忘。</p>
                                <p><strong>LSTM - 精密控制:</strong> 独创“三门一状态”机制，实现信息精细化管理，擅长长期记忆。</p>
                                <p><strong>CNN - 模式之眼:</strong> 依靠“卷积”与“池化”，专注捕捉局部特征，是图像识别的王者。</p>
                            </div>
                            <button className="reset-btn modal-reset-btn" onClick={handleReset}>再玩一次</button>
                        </div>
                    </div>
                )}

                {/* ... existing knowledge and comparison sections ... */}
                <div className="ca-section knowledge-section"><h1 className="ca-title">RNN 核心知识</h1><div className="knowledge-cards-grid">{knowledgeCards.map((card, index) => ( <div className="knowledge-card" key={index}><h3 className="card-title"><span className="card-icon">{card.icon}</span>{card.title}</h3><p>{card.content}</p></div> ))}</div></div>
                <div className="ca-section comparison-section">
                    <h1 className="ca-title">RNN vs. LSTM vs. CNN：内部结构对比</h1>
                    <div className="comparison-grid">
                        <div className="unit-container">
                            <h2>基础 RNN 单元</h2>
                            <RnnUnit onHover={(part) => setExplanation(componentExplanations[part] || componentExplanations.default)} />
                            <p className="unit-desc">RNN的重要模块只有一个非常简单的结构，例如一个tanh层。这种简单性使其难以有效捕获长期依赖关系。</p>
                        </div>
                        <div className="unit-container">
                            <h2>LSTM 单元</h2>
                            <LstmUnit onHover={(part) => setExplanation(componentExplanations[part] || componentExplanations.default)} />
                            <p className="unit-desc">LSTM通过引入“门”结构和独立的“细胞状态”来解决这个问题。这使其能够更好地控制信息的保留和遗忘。</p>
                        </div>
                        <div className="unit-container">
                            <h2>CNN 单元</h2>
                            <CnnUnit onHover={(part) => setExplanation(componentExplanations[part] || componentExplanations.default)} />
                            <p className="unit-desc">CNN的核心是通过“卷积”和“池化”操作来提取空间特征。它并不处理序列数据，而是专注于识别模式。</p>
                        </div>
                    </div>
                    <div className="explanation-box"><h4>组件解析：</h4><p>{explanation}</p></div>
                </div>

                <div className="ca-section interactive-builder">
                    {!challengeStarted ? (
                        <div className="challenge-start-view">
                            <h1 className="ca-title">准备好接受挑战了吗？</h1>
                            <p className="builder-intro">在“计时挑战”模式中，亲手搭建三个经典的神经网络单元，在实践中领悟它们的内在差异！</p>
                            <button className="start-challenge-btn" onClick={handleStartChallenge}>开始挑战</button>
                        </div>
                    ) : (
                        <>
                            <div className="builder-header">
                                <h1 className="ca-title">动手搭建神经网络单元</h1>
                                <div className="builder-toolbar">
                                    <div className="timer">计时: <span>{(elapsedTime / 1000).toFixed(1)}s</span></div>
                                    <button className="hint-btn" onClick={handleGiveHint}><FaLightbulb /> 给我一个提示</button>
                                </div>
                            </div>
                            <p className="builder-intro">从下面的“零件池”中，将组件拖拽到对应的神经网络搭建区，构建你的模型！</p>
                            <div className="builder-container">
                                <div className="components-pool-container"><DroppableZone id="pool" title="零件池" items={containers.pool} validationStatus={validationStatus} isHinted={hintTarget} /></div>
                                <div className="droppable-areas">
                                    <DroppableZone id="rnn" title="RNN 搭建区" items={containers.rnn} validationStatus={validationStatus} isHinted={hintTarget && hintTarget.containerId === 'rnn'} />
                                    <DroppableZone id="lstm" title="LSTM 搭建区" items={containers.lstm} validationStatus={validationStatus} isHinted={hintTarget && hintTarget.containerId === 'lstm'} />
                                    <DroppableZone id="cnn" title="CNN 搭建区" items={containers.cnn} validationStatus={validationStatus} isHinted={hintTarget && hintTarget.containerId === 'cnn'} />
                                </div>
                            </div>
                            <div className="builder-explanation-box"><h4>模型解析:</h4><p>{builderExplanation.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p></div>
                            <div className="builder-actions">
                                <button onClick={handleValidate} className="validate-btn">完成搭建</button>
                                <button onClick={handleReset} className="reset-btn">放弃并重置</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DndContext>
    );
}

export default ComparativeAnalysis;
