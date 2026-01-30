async function test_analysis() {
    const payload = {
        workerType: "regular",
        companySize: "5more",
        manualText: "원본 계약서 텍스트입니다.",
        structuredData: {
            "기본정보": { "사업장명": { "value": "테스트 사업장", "note": "비고 테스트" } }
        },
        serviceType: "contract"
    };

    try {
        console.log('Sending analysis request to port 3001...');
        const res = await fetch('http://localhost:3001/api/analyze/contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Error ${res.status}: ${errorText}`);
            return;
        }

        const data = await res.json();
        console.log('Success!', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

test_analysis();
