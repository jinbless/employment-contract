// 근로계약서 필수 명시사항 매핑
export const legalRequirements = {
    "임금총액": {
        category: "서면필수",
        requirement: "임금을 구성항목, 계산방법, 지급방법을 서면으로 명시하고 근로자에게 교부해주세요 (근로기준법 제17조)",
        priority: 1
    },
    "기본급": {
        category: "서면필수",
        requirement: "기본급과 같은 임금의 구성항목은 반드시 서면으로 명시해야 해요",
        priority: 1
    },
    "임금계산방법": {
        category: "서면필수",
        requirement: "임금이 어떻게 계산되는지 구체적인 수식을 명시하는 것이 중요해요",
        priority: 1
    },
    "임금지급방법": {
        category: "서면필수",
        requirement: "임금을 매달 언제, 어떤 방식으로 지급할지 서면으로 정해주세요",
        priority: 1
    },
    "소정근로시간": {
        category: "서면필수",
        requirement: "하루에 몇 시간 일하기로 했는지 소정근로시간을 서면으로 적어주세요",
        priority: 2
    },
    "주휴일": {
        category: "서면필수",
        requirement: "1주일에 평균 1회 이상의 유급휴일(주휴일)을 서면으로 보장해야 해요",
        priority: 3
    },
    "연차유급휴가": {
        category: "서면필수",
        requirement: "연차유급휴가에 관한 사항을 서면으로 기재해주세요 (5인 이상 사업장 필수)",
        priority: 4,
        applicableTo: "5more"
    },
    "근무장소": {
        category: "명시필수",
        requirement: "주로 어디서 근무하게 될지 장소를 명시해주세요",
        priority: 5
    },
    "업무내용": {
        category: "명시필수",
        requirement: "어떤 업무를 담당하게 될지 구체적으로 명시해주세요",
        priority: 5
    },
    "근로계약기간": {
        category: "서면필수(기간제)",
        requirement: "계약직(기간제)인 경우 계약 시작일과 종료일을 반드시 서면으로 적어주세요",
        priority: 5
    },
    "근무일": {
        category: "서면필수(단시간)",
        requirement: "아르바이트(단시간)인 경우 근무 요일을 서면으로 명시해야 해요",
        priority: 6
    },
    "근로계약서교부": {
        category: "필수",
        requirement: "근로계약을 체결하면 반드시 계약서 1부를 근로자에게 전달(교부)해주세요",
        priority: 7
    },
    "휴게시간": {
        category: "서면필수",
        requirement: "4시간 근무 시 30분, 8시간 근무 시 1시간 이상의 휴게시간을 명시해주세요",
        priority: 2
    }
};

// 카테고리별 색상
export const categoryColors = {
    "서면필수": "#ef4444",      // 빨강
    "서면필수(기간제)": "#f59e0b", // 주황
    "서면필수(단시간)": "#f59e0b",
    "명시필수": "#3b82f6",      // 파랑
    "필수": "#8b5cf6"           // 보라
};
