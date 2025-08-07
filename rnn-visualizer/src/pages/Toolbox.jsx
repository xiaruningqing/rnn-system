import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './Toolbox.css';

const initialSteps = [
    { id: '1', title: '定义RNN模型', description: '使用Pytorch定义一个简单的RNN模型结构，包括嵌入层、RNN层和全连接层。', code: `import torch.nn as nn\n\nclass SimpleRNN(nn.Module):\n    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim):\n        super().__init__()\n        self.embedding = nn.Embedding(vocab_size, embedding_dim)\n        self.rnn = nn.RNN(embedding_dim, hidden_dim)\n        self.fc = nn.Linear(hidden_dim, output_dim)\n        \n    def forward(self, text):\n        embedded = self.embedding(text)\n        output, hidden = self.rnn(embedded)\n        return self.fc(hidden.squeeze(0))` },
    { id: '2', title: '实例化模型与定义损失函数', description: '创建RNN模型实例，并定义损失函数（如交叉熵损失）和优化器（如Adam）。', code: `# 2. 实例化与定义损失函数\nINPUT_DIM = 1000\nEMBEDDING_DIM = 100\nHIDDEN_DIM = 256\nOUTPUT_DIM = 2\n\nmodel = SimpleRNN(INPUT_DIM, EMBEDDING_DIM, HIDDEN_DIM, OUTPUT_DIM)\ncriterion = nn.CrossEntropyLoss()\noptimizer = torch.optim.Adam(model.parameters())` },
    { id: '3', title: '模型训练', description: '遍历训练数据，前向传播计算输出，计算损失，反向传播更新模型权重。', code: `# 3. 模型训练\ndef train(model, iterator, optimizer, criterion):\n    model.train()\n    for batch in iterator:\n        optimizer.zero_grad()\n        predictions = model(batch.text).squeeze(1)\n        loss = criterion(predictions, batch.label)\n        loss.backward()\n        optimizer.step()` },
    { id: '4', title: '准备训练数据', description: '收集原始文本数据，划分训练集、验证集和测试集。', code: `# 4. 准备训练数据\n# 加载数据集，例如IMDB电影评论情感分类数据集\n# train_data, test_data = load_imdb_data()` },
    { id: '5', title: '创建数据加载器', description: '创建数据集类，将文本转换为张量，设置数据加载器。', code: `# 5. 创建数据加载器\n# 定义文本处理管道和数据加载器\n# train_dataloader = DataLoader(train_dataset, batch_size=32, shuffle=True)` },
    { id: '6', title: '模型评估', description: '在测试集上评估模型性能，计算准确率和损失。', code: `# 6. 模型评估\n# 在测试集上评估模型\n# accuracy = evaluate_model(model, test_loader)` },
];

const correctOrder = ['1', '4', '5', '2', '3', '6'];

function SortableItem({ id, item, isHinted }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        boxShadow: isDragging ? "0 4px 15px rgba(0, 242, 234, 0.4)" : "none"
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`sortable-item ${isHinted ? 'hinted' : ''}`}>
            <div className="item-number">{id}</div>
            <div className="item-content">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
            </div>
        </div>
    );
}

function Toolbox() {
    const [steps, setSteps] = useState(() => {
        const shuffled = [...initialSteps];
        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    });
    const [isSortedCorrectly, setIsSortedCorrectly] = useState(false);
    const [incorrectIndices, setIncorrectIndices] = useState([]);
    const navigate = useNavigate();

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setIncorrectIndices([]); // Reset hints on drag
            setSteps((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }, []);
    
    const verifySort = () => {
        const currentOrder = steps.map(step => step.id);
        if (JSON.stringify(currentOrder) === JSON.stringify(correctOrder)) {
            setIsSortedCorrectly(true);
            setIncorrectIndices([]);
        } else {
            const wrongs = [];
            currentOrder.forEach((id, index) => {
                if(id !== correctOrder[index]) {
                    wrongs.push(index);
                }
            });
            setIncorrectIndices(wrongs);
        }
    };

    const handleNavigate = () => {
        navigate('/text-classification');
    };

    return (
        <>
            <div className="toolbox-container">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="steps-panel">
                        <h2 className="panel-title">步骤排序区域</h2>
                        <p className="panel-subtitle">请拖动下方的卡片，将RNN模型训练的步骤按照正确的逻辑顺序进行排列。</p>
                        <div className="sortable-list-container">
                            <SortableContext items={steps.map(item => item.id)} strategy={verticalListSortingStrategy}>
                                {steps.map((item, index) => (
                                    <SortableItem key={item.id} id={item.id} item={item} isHinted={incorrectIndices.includes(index)} />
                                ))}
                            </SortableContext>
                        </div>
                        <div className="verification-area">
                             <button onClick={verifySort} className="verify-btn">
                                验证排序
                            </button>
                            {incorrectIndices.length > 0 && (
                                <p className="error-message">排序有误，红色高亮部分为错误位置。</p>
                            )}
                        </div>
                    </div>
                    <div className="code-panel">
                        <h2 className="panel-title">代码实时预览</h2>
                        <p className="panel-subtitle">您当前的排序会实时反映在下方的代码顺序中。</p>
                        <div className="code-display-container">
                            <SyntaxHighlighter language="python" style={atomOneDark} showLineNumbers>
                                {steps.map(step => step.code).join('\n\n')}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                </DndContext>
            </div>

            {isSortedCorrectly && (
                <div className="success-overlay">
                    <div className="success-modal">
                        <h2>恭喜您，完成排序！</h2>
                        <p>您已成功掌握了RNN模型训练的基本流程。</p>
                        <button onClick={handleNavigate} className="navigate-btn">
                            进入文本分类体验
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Toolbox;
