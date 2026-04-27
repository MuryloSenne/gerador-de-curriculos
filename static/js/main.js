let currentTemplate = 'basic';
let skills = [];
let currentPaymentId = null;

// CONFIGURAÇÃO DO PIX
const PIX_CONFIG = {
    key: "38064658861",
    name: "MURYLOSENNE",
    city: "RIO CLARO",
    amount: "2.00"
};

document.addEventListener('DOMContentLoaded', () => {
    initSync();
    initZoom();
    initSkills();
    initTemplateSelector();
    initPhoto();
});

function crc16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function generatePixPayload() {
    const key = PIX_CONFIG.key;
    const name = PIX_CONFIG.name;
    const city = PIX_CONFIG.city;
    const amount = PIX_CONFIG.amount;

    let payload = "000201";
    payload += "26" + (22 + key.length).toString() + "0014br.gov.bcb.pix01" + key.length.toString().padStart(2, '0') + key;
    payload += "52040000"; // Merchant Category Code
    payload += "5303986"; // Currency Code (986 = BRL)
    if (amount) {
        payload += "54" + amount.length.toString().padStart(2, '0') + amount;
    }
    payload += "5802BR"; // Country Code
    payload += "59" + name.length.toString().padStart(2, '0') + name; // Merchant Name
    payload += "60" + city.length.toString().padStart(2, '0') + city; // Merchant City
    payload += "62070503***"; // Transaction Amount
    payload += "6304"; // CRC16

    return payload + crc16(payload);
}

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 600);
    }
});


function initPhoto() {
    const photoInput = document.getElementById('in-photo');
    const cvPhoto = document.getElementById('cv-photo');

    photoInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                cvPhoto.src = event.target.result;
                cvPhoto.parentElement.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

function initTemplateSelector() {
    const radios = document.querySelectorAll('input[name="template"]');
    const hiddenInput = document.getElementById('current-template');
    const previewPaper = document.getElementById('cv-preview');
    const cards = document.querySelectorAll('.template-card');

    function updateTemplateUI(value) {
        hiddenInput.value = value;
        currentTemplate = value;
        previewPaper.className = `cv-paper ${value}`;
        cards.forEach(card => {
            card.style.borderColor = '#e2e8f0';
            card.style.backgroundColor = 'transparent';
        });
        const selectedRadio = document.querySelector(`input[name="template"][value="${value}"]`);
        if (selectedRadio) {
            const selectedCard = selectedRadio.nextElementSibling;
            selectedCard.style.borderColor = '#2563eb';
            selectedCard.style.backgroundColor = '#eff6ff';
        }
    }

    radios.forEach(radio => {
        radio.addEventListener('change', (e) => updateTemplateUI(e.target.value));
    });
}

function initSync() {
    const syncInputs = document.querySelectorAll('[data-sync]');
    syncInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const targetId = e.target.getAttribute('data-sync');
            const target = document.getElementById(targetId);
            if (target) target.innerText = e.target.value;
            const sideTarget = document.getElementById(`${targetId}-side`);
            if (sideTarget) sideTarget.innerText = e.target.value;
        });
    });
}

function syncDynamic(input, targetId) {
    const target = document.getElementById(targetId);
    if (target) target.innerText = input.value;
}

function initZoom() {
    const canvas = document.getElementById('cv-preview');
    const levelDisplay = document.getElementById('zoom-level');
    let scale = 0.8;

    const autoScale = () => {
        if (window.innerWidth < 480) {
            scale = (window.innerWidth - 30) / 800;
        } else if (window.innerWidth < 1024) {
            scale = (window.innerWidth - 100) / 800;
        } else {
            scale = 0.8;
        }
        if (scale > 1) scale = 1;
        if (scale < 0.2) scale = 0.2;
        updateScale();
    };

    if (document.getElementById('zoom-in')) {
        document.getElementById('zoom-in').addEventListener('click', () => {
            scale += 0.1;
            updateScale();
        });
    }

    if (document.getElementById('zoom-out')) {
        document.getElementById('zoom-out').addEventListener('click', () => {
            scale -= 0.1;
            updateScale();
        });
    }

    function updateScale() {
        canvas.style.setProperty('transform', `scale(${scale})`, 'important');
        if (levelDisplay) levelDisplay.innerText = `${Math.round(scale * 100)}%`;
    }

    autoScale();
    window.addEventListener('resize', autoScale);
}

// HABILIDADES
function initSkills() {
    const input = document.getElementById('skill-input');
    if (!input) return;
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = input.value.trim();
            if (val && !skills.includes(val)) {
                addSkill(val);
                input.value = '';
            }
        }
    });
}

function addSkill(name) {
    skills.push(name);
    const tagsContainer = document.getElementById('skills-tags');
    const previewMain = document.getElementById('preview-skills-list-main');
    const previewSide = document.getElementById('preview-skills-list-side');
    const id = `skill-${Date.now()}`;

    const tag = document.createElement('div');
    tag.className = 'skill-tag-input';
    tag.innerHTML = `${name} <span onclick="removeSkill('${name}', '${id}')">×</span>`;
    tagsContainer.appendChild(tag);

    const pTagMain = document.createElement('div');
    pTagMain.className = 'skill-tag';
    pTagMain.id = `preview-main-${id}`;
    pTagMain.innerText = name;
    if (previewMain) previewMain.appendChild(pTagMain);

    const pTagSide = document.createElement('div');
    pTagSide.className = 'skill-tag';
    pTagSide.id = `preview-side-${id}`;
    pTagSide.innerText = name;
    if (previewSide) previewSide.appendChild(pTagSide);
}

function removeSkill(name, id) {
    skills = skills.filter(s => s !== name);
    const tag = document.querySelector(`.skill-tag-input [onclick*="${id}"]`)?.parentElement;
    if (tag) tag.remove();
    document.getElementById(`preview-main-${id}`)?.remove();
    document.getElementById(`preview-side-${id}`)?.remove();
}

// EXPERIENCIA E EDUCAÇÃO
function addExperience() {
    const container = document.getElementById('exp-items');
    const id = Date.now();
    const html = `
        <div class="dynamic-item" id="exp-${id}">
            <button type="button" class="remove-btn" onclick="removeItem('exp-${id}', 'preview-exp-${id}')">×</button>
            <div class="input-group">
                <label>Empresa</label>
                <input type="text" placeholder="Empresa S/A" oninput="syncDynamic(this, 'preview-exp-comp-${id}')">
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>Cargo</label>
                    <input type="text" placeholder="Desenvolvedor" oninput="syncDynamic(this, 'preview-exp-role-${id}')">
                </div>
                <div class="input-group">
                    <label>Período</label>
                    <input type="text" placeholder="2020 - Presente" oninput="syncDynamic(this, 'preview-exp-period-${id}')">
                </div>
            </div>
            <div class="input-group">
                <label>Descrição</label>
                <textarea placeholder="Descreva suas responsabilidades..." oninput="syncDynamic(this, 'preview-exp-desc-${id}')"></textarea>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    document.getElementById('preview-exp-list').insertAdjacentHTML('beforeend', `
        <div class="preview-item" id="preview-exp-${id}">
            <div class="preview-item-header">
                <strong><span id="preview-exp-role-${id}">Cargo</span></strong>
                <span class="period" id="preview-exp-period-${id}">Período</span>
            </div>
            <em><span id="preview-exp-comp-${id}">Empresa</span></em>
            <p id="preview-exp-desc-${id}"></p>
        </div>
    `);
}

function addEducation() {
    const container = document.getElementById('edu-items');
    const id = Date.now();
    const html = `
        <div class="dynamic-item" id="edu-${id}">
            <button type="button" class="remove-btn" onclick="removeItem('edu-${id}', 'preview-edu-${id}')">×</button>
            <div class="input-row">
                <div class="input-group">
                    <label>Instituição</label>
                    <input type="text" placeholder="Universidade X" oninput="syncDynamic(this, 'preview-edu-school-${id}')">
                </div>
                <div class="input-group">
                    <label>Curso/Grau</label>
                    <input type="text" placeholder="Engenharia" oninput="syncDynamic(this, 'preview-edu-degree-${id}')">
                </div>
            </div>
            <div class="input-group">
                <label>Ano</label>
                <input type="text" placeholder="2023" oninput="syncDynamic(this, 'preview-edu-year-${id}')">
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    document.getElementById('preview-edu-list').insertAdjacentHTML('beforeend', `
        <div class="preview-item" id="preview-edu-${id}">
            <div class="preview-item-header">
                <strong><span id="preview-edu-degree-${id}">Curso</span></strong>
                <span class="period" id="preview-edu-year-${id}">Ano</span>
            </div>
            <em><span id="preview-edu-school-${id}">Instituição</span></em>
        </div>
    `);
}

function removeItem(formId, previewId) {
    document.getElementById(formId)?.remove();
    document.getElementById(previewId)?.remove();
}

// FUNÇÕES DE DOWNLOAD E DOAÇÃO
async function downloadImage() { await executeDownload(); }

async function openPaymentModal() {
    const pixCode = generatePixPayload();
    document.getElementById('pix-code').value = pixCode;
    document.querySelector('#pix-qrcode img').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;
    document.getElementById('payment-modal').classList.add('active');
}

function closePaymentModal() { document.getElementById('payment-modal').classList.remove('active'); }

function copyPixCode() {
    const pixCode = document.getElementById('pix-code');
    pixCode.select();
    document.execCommand('copy');
    alert('PIX Copiado!');
}


async function executeDownload() {
    const paper = document.getElementById('cv-preview');
    const downloadBtn = document.querySelector('.btn-download.pdf');
    const originalBtnText = downloadBtn.innerHTML;
    
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    downloadBtn.disabled = true;
    paper.classList.add('downloading');

    try {
        // Garante que todas as imagens foram carregadas
        const images = paper.getElementsByTagName('img');
        await Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => { img.onload = img.onerror = resolve; });
        }));

        const canvas = await html2canvas(paper, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            onclone: (clonedDoc) => {
                const clonedPaper = clonedDoc.getElementById('cv-preview');
                clonedPaper.style.transform = 'none';
                clonedPaper.style.width = '210mm';
                clonedPaper.style.height = '297mm';
                clonedPaper.style.display = 'block';
                clonedPaper.style.position = 'relative';
                const content = clonedPaper.querySelector('.cv-content');
                if (content) content.style.display = 'flex';
            }
        });

        if (canvas.width === 0 || canvas.height === 0) {
            throw new Error('Falha ao gerar o canvas.');
        }

        canvas.toBlob((blob) => {
            if (!blob) {
                alert('Erro ao gerar o arquivo de imagem.');
                return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `curriculo_${new Date().getTime()}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        }, 'image/png', 1.0);

    } catch (e) {
        console.error('Download Error:', e);
        alert('Erro no download: ' + e.message);
    } finally {
        downloadBtn.innerHTML = originalBtnText;
        downloadBtn.disabled = false;
        paper.classList.remove('downloading');
    }
}

function switchMobileTab(tab) {
    const sidebar = document.querySelector('.editor-sidebar');
    const preview = document.querySelector('.preview-area');
    const tabs = document.querySelectorAll('.tab-btn');

    if (tab === 'edit') {
        sidebar.classList.remove('hidden');
        preview.classList.add('hidden');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        sidebar.classList.add('hidden');
        preview.classList.remove('hidden');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}
