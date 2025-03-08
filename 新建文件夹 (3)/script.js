// 产品数据
const products = [
    {
        id: 1,
        name: "精品包装盒",
        category: "box",
        description: "高档礼品包装，烫金工艺",
        image: "https://img.freepik.com/free-psd/box-packaging-mockup_35913-1963.jpg",
        basePrice: 2.5
    },
    {
        id: 2,
        name: "牛皮纸袋",
        category: "bag",
        description: "环保材质，可定制logo",
        image: "https://img.freepik.com/free-psd/paper-bag-mockup_35913-1741.jpg",
        basePrice: 1.8
    },
    {
        id: 3,
        name: "礼品包装盒",
        category: "box",
        description: "节日礼品包装，精美设计",
        image: "https://img.freepik.com/free-psd/gift-box-packaging-mockup_1332-4994.jpg",
        basePrice: 3.2
    },
    {
        id: 4,
        name: "产品标签",
        category: "label",
        description: "防伪标签，高清印刷",
        image: "https://img.freepik.com/free-psd/label-tag-mockup_1332-4971.jpg",
        basePrice: 0.5
    }
];

// 初始化瀑布流
function initWaterfall() {
    const container = document.getElementById('waterfall');
    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// 创建产品卡片
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <button class="quote-btn" onclick="showQuoteModal(${product.id})">获取报价</button>
    `;
    
    return card;
}

// 显示报价弹窗
function showQuoteModal(productId) {
    const modal = document.getElementById('quoteModal');
    modal.style.display = 'block';
    
    // 存储当前产品ID
    modal.setAttribute('data-product-id', productId);
}

// 关闭报价弹窗
document.querySelector('.close-btn').onclick = function() {
    document.getElementById('quoteModal').style.display = 'none';
};

// 更新计算报价函数
function calculateQuote(product, formData) {
    try {
        // 定义常量
        const PACKING_PRICE = parseFloat(formData.packingPrice) || 50; // 打包基础费用（元/千件）
        const SHIPPING_RATE = parseFloat(formData.shippingRate) || 0.5; // 运费率（元/公里/千克）
        const PROFIT_RATE = parseFloat(formData.profitRate) / 100 || 0.3; // 利润率
        const TAX_RATE = parseFloat(formData.taxRate) / 100 || 0.13; // 税率

        // 验证输入数据
        if (!formData.paperArea || formData.paperArea <= 0) {
            throw new Error('请输入有效的纸张面积');
        }
        if (!formData.printArea || formData.printArea <= 0) {
            throw new Error('请输入有效的印刷面积');
        }
        if (formData.printArea > formData.paperArea) {
            throw new Error('印刷面积不能大于纸张面积');
        }

        // 转换单位：平方毫米到平方米
        const paperArea = formData.paperArea / 1000000;
        const printArea = formData.printArea / 1000000;
        
        // 1. 纸张成本计算
        const paperCost = paperArea * formData.paperPrice * (formData.paperWeight/1000) * formData.quantity;
        const paperCalc = `纸张成本 = ${paperArea.toFixed(4)}㎡ × ${formData.paperPrice}元/㎡ × ${formData.paperWeight/1000}kg × ${formData.quantity}件`;

        // 2. 印刷成本计算
        const printCost = printArea * formData.printPrice * formData.printColors * formData.quantity;
        const printCalc = `印刷成本 = ${printArea.toFixed(4)}㎡ × ${formData.printPrice}元/㎡ × ${formData.printColors}色 × ${formData.quantity}件`;

        // 3. 覆膜成本计算
        let laminationArea = 0;
        let laminationCost = 0;
        let laminationCalc = '不需要覆膜';
        
        if (formData.needLamination) {
            if (!formData.laminationArea || formData.laminationArea <= 0) {
                throw new Error('请输入有效的覆膜面积');
            }
            laminationArea = formData.laminationArea / 1000000; // 转换为平方米
            laminationCost = laminationArea * formData.laminationPrice * formData.quantity;
            laminationCalc = `覆膜成本 = ${laminationArea.toFixed(4)}㎡ × ${formData.laminationPrice}元/㎡ × ${formData.quantity}件`;
        }

        // 4. 模切成本计算
        let dieCutArea = 0;
        let dieCutLineLength = 0;
        let dieCutCost = 0;
        let dieCutCalc = '不需要模切';
        
        if (formData.needDieCut) {
            if (!formData.dieCutArea || formData.dieCutArea <= 0) {
                throw new Error('请输入有效的模切面积');
            }
            if (!formData.dieCutLines || formData.dieCutLines <= 0) {
                throw new Error('请输入有效的模切刀线长度');
            }
            dieCutArea = formData.dieCutArea / 1000000; // 转换为平方米
            dieCutLineLength = formData.dieCutLines / 1000; // 转换为米
            dieCutCost = (dieCutArea * formData.dieCutPrice + dieCutLineLength * 0.5) * formData.quantity;
            dieCutCalc = `模切成本 = (${dieCutArea.toFixed(4)}㎡ × ${formData.dieCutPrice}元/㎡ + ${dieCutLineLength.toFixed(2)}m × 0.5元/m) × ${formData.quantity}件`;
        }

        // 5. 粘盒成本计算
        let glueArea = 0;
        let gluePointCost = 0;
        let glueCost = 0;
        let glueCalc = '不需要粘盒';
        
        if (formData.needGlue) {
            if (!formData.glueArea || formData.glueArea <= 0) {
                throw new Error('请输入有效的粘盒面积');
            }
            if (!formData.gluePoints || formData.gluePoints <= 0) {
                throw new Error('请输入有效的粘合点数量');
            }
            glueArea = formData.glueArea / 1000000; // 转换为平方米
            gluePointCost = formData.gluePoints * 0.01; // 每个粘合点0.01元
            glueCost = (glueArea * formData.gluePrice + gluePointCost) * formData.quantity;
            glueCalc = `粘盒成本 = (${glueArea.toFixed(4)}㎡ × ${formData.gluePrice}元/㎡ + ${formData.gluePoints}点 × 0.01元/点) × ${formData.quantity}件`;
        }

        // 6. 绳子成本计算
        let ropeLength = 0;
        let ropeCost = 0;
        let ropeCalc = '不需要绳子';
        
        if (formData.needRope) {
            if (!formData.ropeLength || formData.ropeLength <= 0) {
                throw new Error('请输入有效的绳子长度');
            }
            ropeLength = formData.ropeLength / 1000; // 转换为米
            ropeCost = ropeLength * formData.ropePrice * formData.quantity;
            ropeCalc = `绳子成本 = ${ropeLength.toFixed(3)}m × ${formData.ropePrice}元/m × ${formData.quantity}件`;
        }

        // 7. 打包成本计算
        const packingCost = PACKING_PRICE * Math.ceil(formData.quantity / 1000);
        const packingCalc = `打包成本 = ${PACKING_PRICE}元/千件 × ${Math.ceil(formData.quantity / 1000)}千件`;

        // 8. 运费计算
        const weight = paperArea * (formData.paperWeight/1000) * formData.quantity; // 总重量（kg）
        const shippingCost = formData.shippingDistance * SHIPPING_RATE * weight;
        const shippingCalc = `运输成本 = ${formData.shippingDistance}公里 × ${SHIPPING_RATE}元/公里/千克 × ${weight.toFixed(2)}kg`;

        // 9. 计算总成本
        const totalCost = paperCost + printCost + laminationCost + dieCutCost + 
                         glueCost + ropeCost + packingCost + shippingCost;

        // 10. 利润计算
        const profit = totalCost * PROFIT_RATE;
        const profitCalc = `利润 = ${totalCost.toFixed(2)}元 × ${(PROFIT_RATE * 100).toFixed(0)}%`;

        // 11. 税费计算
        const tax = (totalCost + profit) * TAX_RATE;
        const taxCalc = `税费 = (${totalCost.toFixed(2)}元 + ${profit.toFixed(2)}元) × ${(TAX_RATE * 100).toFixed(0)}%`;

        // 12. 最终报价
        const finalPrice = totalCost + profit + tax;
        const finalPriceCalc = `最终报价 = ${totalCost.toFixed(2)}元 + ${profit.toFixed(2)}元 + ${tax.toFixed(2)}元`;

        return {
            success: true,
            calculations: {
                paperCalc,
                printCalc,
                laminationCalc,
                dieCutCalc,
                glueCalc,
                ropeCalc,
                packingCalc,
                shippingCalc,
                profitCalc,
                taxCalc,
                finalPriceCalc
            },
            paperCost,
            printCost,
            laminationCost,
            dieCutCost,
            glueCost,
            ropeCost,
            packingCost,
            shippingCost,
            totalCost,
            profit,
            tax,
            finalPrice
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 更新表单提交处理
document.getElementById('quoteForm').onsubmit = function(e) {
    e.preventDefault();
    
    const formData = {
        paperArea: parseFloat(document.getElementById('paperArea').value),
        printArea: parseFloat(document.getElementById('printArea').value),
        quantity: parseInt(document.getElementById('quantity').value),
        paperWeight: parseFloat(document.getElementById('paperWeight').value),
        paperPrice: parseFloat(document.getElementById('paperPrice').value),
        printColors: parseInt(document.getElementById('printColors').value),
        printPrice: parseFloat(document.getElementById('printPrice').value),
        needLamination: document.getElementById('needLamination').checked,
        needDieCut: document.getElementById('needDieCut').checked,
        needGlue: document.getElementById('needGlue').checked,
        needRope: document.getElementById('needRope').checked,
        shippingDistance: parseFloat(document.getElementById('shippingDistance').value),
        laminationPrice: parseFloat(document.getElementById('laminationPrice').value),
        laminationArea: parseFloat(document.getElementById('laminationArea').value),
        dieCutPrice: parseFloat(document.getElementById('dieCutPrice').value),
        dieCutArea: parseFloat(document.getElementById('dieCutArea').value),
        dieCutLines: parseFloat(document.getElementById('dieCutLines').value),
        gluePrice: parseFloat(document.getElementById('gluePrice').value),
        glueArea: parseFloat(document.getElementById('glueArea').value),
        gluePoints: parseInt(document.getElementById('gluePoints').value),
        ropePrice: parseFloat(document.getElementById('ropePrice').value),
        ropeLength: parseFloat(document.getElementById('ropeLength').value)
    };
    
    const result = calculateQuote(null, formData);
    
    if (!result.success) {
        // 显示错误信息
        document.getElementById('quoteResult').innerHTML = `
            <div style="background-color: #ffebee; padding: 15px; color: #c62828;">
                <h3>计算错误</h3>
                <p>${result.error}</p>
            </div>
        `;
        return;
    }
    
    // 显示报价结果
    document.getElementById('quoteResult').innerHTML = `
        <div class="quote-result-container">
            <h3>详细报价计算</h3>
            
            <div class="calculation-process">
                <h4>计算过程</h4>
                <div class="calc-item">
                    <p>${result.calculations.paperCalc}</p>
                    <p>= ¥${result.paperCost.toFixed(2)}</p>
                </div>
                <div class="calc-item">
                    <p>${result.calculations.printCalc}</p>
                    <p>= ¥${result.printCost.toFixed(2)}</p>
                </div>
                <div class="calc-item">
                    <p>${result.calculations.laminationCalc}</p>
                    <p>= ¥${result.laminationCost.toFixed(2)}</p>
                </div>
                <div class="calc-item">
                    <p>${result.calculations.dieCutCalc}</p>
                    <p>= ¥${result.dieCutCost.toFixed(2)}</p>
                </div>
                <div class="calc-item">
                    <p>${result.calculations.glueCalc}</p>
                    <p>= ¥${result.glueCost.toFixed(2)}</p>
                </div>
                <div class="calc-item">
                    <p>${result.calculations.ropeCalc}</p>
                    <p>= ¥${result.ropeCost.toFixed(2)}</p>
                </div>
                <div class="calc-item">
                    <p>${result.calculations.packingCalc}</p>
                    <p>= ¥${result.packingCost.toFixed(2)}</p>
                </div>
                <div class="calc-item">
                    <p>${result.calculations.shippingCalc}</p>
                    <p>= ¥${result.shippingCost.toFixed(2)}</p>
                </div>
            </div>

            <div class="final-price">
                <h4>费用汇总</h4>
                <div class="cost-item">
                    <strong>总成本：</strong>
                    <span>${result.calculations.totalCost}</span>
                </div>
                <div class="cost-item">
                    <strong>利润：</strong>
                    <span>${result.calculations.profitCalc}</span>
                </div>
                <div class="cost-item">
                    <strong>税费：</strong>
                    <span>${result.calculations.taxCalc}</span>
                </div>
                <div class="cost-item" style="font-size: 1.2em; color: #2196F3;">
                    <strong>最终报价：</strong>
                    <span>${result.calculations.finalPriceCalc}</span>
                </div>
                <div class="cost-item">
                    <strong>单件价格：</strong>
                    <span>${(result.finalPrice/formData.quantity).toFixed(2)}</span>
                </div>
            </div>

            <div class="company-info">
                <p>报价系统</p>
                <p>联系电话：XXX-XXXXXXXX</p>
                <p>地址：XX省XX市XX区XX路XX号</p>
                <p style="color: #666; font-style: italic;">* 此报价为系统估算，实际价格以客服确认为准</p>
            </div>
        </div>
    `;
};

// 筛选功能
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        filterProducts(category);
    });
});

// 筛选产品
function filterProducts(category) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 页面加载完成后初始化
window.onload = function() {
    initWaterfall();
};

// 添加复选框变化事件处理
document.getElementById('needLamination').addEventListener('change', function() {
    const inputs = ['laminationArea', 'laminationPrice'];
    inputs.forEach(id => {
        document.getElementById(id).disabled = !this.checked;
        if (!this.checked) document.getElementById(id).value = '';
    });
});

document.getElementById('needDieCut').addEventListener('change', function() {
    const inputs = ['dieCutArea', 'dieCutLines', 'dieCutPrice'];
    inputs.forEach(id => {
        document.getElementById(id).disabled = !this.checked;
        if (!this.checked) document.getElementById(id).value = '';
    });
});

document.getElementById('needGlue').addEventListener('change', function() {
    const inputs = ['glueArea', 'gluePoints', 'gluePrice'];
    inputs.forEach(id => {
        document.getElementById(id).disabled = !this.checked;
        if (!this.checked) document.getElementById(id).value = '';
    });
});

document.getElementById('needRope').addEventListener('change', function() {
    const inputs = ['ropeLength', 'ropePrice'];
    inputs.forEach(id => {
        document.getElementById(id).disabled = !this.checked;
        if (!this.checked) document.getElementById(id).value = '';
    });
}); 