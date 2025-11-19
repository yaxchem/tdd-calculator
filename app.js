const requestDateInput = document.querySelector('#request-date')
const tddInput = document.querySelector('#tdd')
const serviceTypeInput = document.querySelector('#service-type')
const curationMessageInput = document.querySelector('#curation-message')
const pagesNoInput = document.querySelector('#pages-no')
const form = document.querySelector('form')
const copyDateBtn = document.querySelector('#copy-date')
const copyMessageBtn = document.querySelector('#copy-message')
const region = document.querySelector('#updated-date')

populateSelect()
const today = new Date()
requestDateInput.value = formatAsYMD(today)
updateTddInput()

form.addEventListener('submit', (e) => { e.preventDefault() })
requestDateInput.addEventListener('change', (e) => {e.preventDefault(); updateTddInputAlert(e)})
serviceTypeInput.addEventListener('change', (e) => {e.preventDefault(); updateTddInputAlert(e)})
pagesNoInput.addEventListener('change', (e) => {e.preventDefault(); updateTddInputAlert(e)})

function populateSelect() {
    let html = ''
    for (const service of services) {
        html += `<option value=${service.value}>${service.label}</option>`
    }
    serviceTypeInput.innerHTML = html;
}

function updateTddInputAlert() {
    const longDate = updateTddInput()
    updateCurationMessage(longDate)
    region.textContent = 'Updated Target Delivery Date'
    setTimeout(() => {
        region.textContent = ''
    }, 5);
}

function updateCurationMessage(tddDate) {
    const message = 
    `Based on preliminary scoping and estimated capacity, our **target** delivery date is **${tddDate}**.
Please note, this request is currently being resourced, and a confirmed delivery date will be shared with you once resources are assigned.
Thank you for your continued partnership.
Best regards,`;
    curationMessageInput.value = message
}

copyDateBtn.addEventListener('click', async () => {
    const text = tddInput.value ?? '';
    const slashedDate = toSlashDate(text);
    try {
        await copyText(slashedDate);
        alert(`✅ Copied! ${slashedDate}`)
    } catch (e) {
        alert('❌ Could not copy');
    }
});

copyMessageBtn.addEventListener('click', async () => {
    const text = curationMessageInput.value ?? '';
    try {
        await copyText(text);
        alert(`✅ Copied!`)
    } catch (e) {
        alert('❌ Could not copy');
    }
});

function parseLocalCalendarDate(value) {
    if (!value) return null;

    if (value.includes('-')) {
        const [y, m, d] = value.split('-').map(Number);
        return new Date(y, m - 1, d, 12);
    } else if (value.includes('/')) {
        const [m, d, y] = value.split('/').map(Number);
        return new Date(y, m - 1, d, 12);
    }

    return new Date(value);
}

function addWorkdays(date, days) {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
        result.setDate(result.getDate() + 1);
        const day = result.getDay();
        if (day !== 0 && day !== 6) {
            added++;
        }
    }
    return result;
}

function calculateDaysToAdd(serviceType) {
    const service = services.find(el => el.value === serviceType);
    const pagesNo = pagesNoInput.value
    let daysToAdd = 0;
    if (serviceType === 'full-manual-evaluation') {
        daysToAdd = Math.floor(service.attc + service.buffer + fmeDetails.scoping + fmeDetails.triage + (fmeDetails.pageEffort + fmeDetails.finalReview) * pagesNo)
    } else {
        daysToAdd = Math.floor(service.attc + service.buffer)
    }
    return daysToAdd;
}

function calculateTdd(daysToAdd) {
    const start = parseLocalCalendarDate(requestDateInput.value);
    const tdd = addWorkdays(start, daysToAdd);
    return tdd;

}

function formatAsYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function toSlashDate(ymd) {
    const dashedDate = ymd.split('-')
    const slashedDate = [dashedDate[1], dashedDate[2], dashedDate[0]].join('/')
    return slashedDate;
}

function updateTddInput() {
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }
    const daysToAdd = calculateDaysToAdd(serviceTypeInput.value)
    const tdd = calculateTdd(daysToAdd)
    const longDate = tdd.toLocaleString('en-US', options)
    tddInput.value = formatAsYMD(tdd)
    return longDate
}

async function copyText(text) {
    await navigator.clipboard.writeText(text);
    return;
}

