$content = Get-Content "c:\Users\Jini\Desktop\김지은\01_개발\test\src\App.jsx" -Raw -Encoding UTF8

# 1. import 수정
$content = $content -replace "import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';"
$content = $content -replace "import { legalRequirements } from './legalRequirements';", "import { legalRequirements } from './legalRequirements';`nimport { getRandomTip } from './loadingTips';"

# 2. state 추가 - structuredData 뒤에 currentTip 추가
$content = $content -replace "(\[structuredData, setStructuredData\] = useState\(''\);)", "`$1`n    const [currentTip, setCurrentTip] = useState(getRandomTip());`n`n    useEffect(() => {`n        if (isAnalyzing) {`n            const tipInterval = setInterval(() => {`n                setCurrentTip(getRandomTip());`n            }, 4000);`n            return () => clearInterval(tipInterval);`n        }`n    }, [isAnalyzing]);"

# 3. 권고사항 클릭 가능하게 수정
$oldRecommendation = '{item.개선권고 && <div style={{ marginTop: ''0.8rem'', padding: ''1rem'', background: ''#f8fafc'', borderRadius: ''10px'', borderLeft: ''4px solid #3b82f6'', fontSize: ''0.9rem'', fontWeight: 600 }}>💡 권고: {item.개선권고}</div>}'
$newRecommendation = @'
{item.개선권고 && (
                                                                    <div 
                                                                        onClick={() => alert(item.개선권고)}
                                                                        style={{ 
                                                                            marginTop: '0.8rem', 
                                                                            padding: '1rem', 
                                                                            background: '#f8fafc', 
                                                                            borderRadius: '10px', 
                                                                            borderLeft: '4px solid #3b82f6', 
                                                                            fontSize: '0.9rem', 
                                                                            fontWeight: 600,
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.2s'
                                                                        }}
                                                                        onMouseEnter={(e) => e.target.style.background = '#e0f2fe'}
                                                                        onMouseLeave={(e) => e.target.style.background = '#f8fafc'}
                                                                    >
                                                                        💡 권고: {item.개선권고.length > 50 ? item.개선권고.substring(0, 50) + '... (클릭하여 전체보기)' : item.개선권고}
                                                                    </div>
                                                                )}
'@
$content = $content -replace [regex]::Escape($oldRecommendation), $newRecommendation

$content | Out-File "c:\Users\Jini\Desktop\김지은\01_개발\test\src\App.jsx" -Encoding UTF8 -NoNewline

Write-Host "App.jsx 수정 완료!"
