/* generated from data/*.csv — run node scripts/build-spec.mjs */

export type SpecItem = {
  id: string;
  name: string;
  desc?: string;
  purchasable: boolean;
  linkCount: number;
  linkNote?: string;
};

export type SpecLink = {
  itemId: string;
  order: number;
  type: string;
  text: string;
  url: string;
};

export const SPEC_ITEMS: Record<string, SpecItem> = {
  "I0001": {
    "id": "I0001",
    "name": "여권",
    "desc": "유효기간 6개월 이상 남았는지 함께 확인",
    "purchasable": false,
    "linkCount": 0
  },
  "I0002": {
    "id": "I0002",
    "name": "여행자보험 증서(모바일)",
    "purchasable": true,
    "linkCount": 1,
    "linkNote": "인터넷으로 가입하는 것이 가장 저렴해요. 트리플에서 빠르게 가입하고 안전하게 해외로 떠나세요!"
  },
  "I0003": {
    "id": "I0003",
    "name": "상비약(해열/진통/소화제)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0004": {
    "id": "I0004",
    "name": "해외용 멀티 어댑터",
    "desc": "콘센트 모양이 다른 국가용",
    "purchasable": true,
    "linkCount": 0
  },
  "I0005": {
    "id": "I0005",
    "name": "보조배터리",
    "desc": "기내 반입만 가능, 위탁 금지",
    "purchasable": true,
    "linkCount": 0
  },
  "I0006": {
    "id": "I0006",
    "name": "우산 또는 우비",
    "purchasable": true,
    "linkCount": 0
  },
  "I0007": {
    "id": "I0007",
    "name": "반팔 옷",
    "purchasable": true,
    "linkCount": 0
  },
  "I0009": {
    "id": "I0009",
    "name": "경량 패딩·방한복",
    "purchasable": true,
    "linkCount": 0
  },
  "I0010": {
    "id": "I0010",
    "name": "방한 모자·장갑",
    "purchasable": true,
    "linkCount": 0
  },
  "I0011": {
    "id": "I0011",
    "name": "자외선차단제",
    "purchasable": true,
    "linkCount": 0
  },
  "I0012": {
    "id": "I0012",
    "name": "방수팩(드라이백)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0013": {
    "id": "I0013",
    "name": "수영복",
    "purchasable": true,
    "linkCount": 0
  },
  "I0014": {
    "id": "I0014",
    "name": "물안경",
    "purchasable": true,
    "linkCount": 0
  },
  "I0015": {
    "id": "I0015",
    "name": "등산화",
    "purchasable": true,
    "linkCount": 0
  },
  "I0016": {
    "id": "I0016",
    "name": "등산 스틱",
    "desc": "기내 반입 불가, 위탁수하물만 가능",
    "purchasable": true,
    "linkCount": 0
  },
  "I0017": {
    "id": "I0017",
    "name": "골프 클럽(위탁수하물 별도 신고)",
    "desc": "항공사별 위탁 규정 사전 확인 필요",
    "purchasable": false,
    "linkCount": 0
  },
  "I0018": {
    "id": "I0018",
    "name": "유모차",
    "purchasable": false,
    "linkCount": 0
  },
  "I0019": {
    "id": "I0019",
    "name": "기저귀·물티슈",
    "purchasable": true,
    "linkCount": 0
  },
  "I0020": {
    "id": "I0020",
    "name": "반려동물 이동장",
    "purchasable": false,
    "linkCount": 0
  },
  "I0021": {
    "id": "I0021",
    "name": "부모님 개인 처방약",
    "desc": "부모님 본인만 준비 가능, 여유분 권장",
    "purchasable": false,
    "linkCount": 0
  },
  "I0022": {
    "id": "I0022",
    "name": "삼각대·짐벌",
    "purchasable": true,
    "linkCount": 0
  },
  "I0023": {
    "id": "I0023",
    "name": "어깨·무릎 가리는 겉옷",
    "desc": "사원 등 종교시설 복장 규정 대응",
    "purchasable": true,
    "linkCount": 0
  },
  "I0024": {
    "id": "I0024",
    "name": "텐트·침낭",
    "purchasable": true,
    "linkCount": 0
  },
  "I0025": {
    "id": "I0025",
    "name": "벌레기피제",
    "purchasable": true,
    "linkCount": 0
  },
  "I0027": {
    "id": "I0027",
    "name": "전자담배·액상(휴대 여부 확인용)",
    "desc": "국가별 반입 가능 여부가 크게 다름",
    "purchasable": false,
    "linkCount": 0
  },
  "I0028": {
    "id": "I0028",
    "name": "손소독제·개인 물티슈",
    "purchasable": true,
    "linkCount": 0
  },
  "I0029": {
    "id": "I0029",
    "name": "기초 세면도구(칫솔·치약·클렌저 등)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0030": {
    "id": "I0030",
    "name": "항공권(모바일 e-티켓)",
    "desc": "탑승 수속·입국 심사에 필요",
    "purchasable": false,
    "linkCount": 0
  },
  "I0031": {
    "id": "I0031",
    "name": "해외 결제 가능 카드",
    "desc": "해외 결제·ATM 출금 가능 여부 확인",
    "purchasable": false,
    "linkCount": 1
  },
  "I0032": {
    "id": "I0032",
    "name": "eSIM 또는 로밍 데이터",
    "desc": "지도·번역·예약 확인 등에 필요",
    "purchasable": true,
    "linkCount": 3,
    "linkNote": "트리플을 통해 예약하면 포켓 와이파이는 10~30%, 유심은 최대 10% 할인받을 수 있어요."
  },
  "I0033": {
    "id": "I0033",
    "name": "카메라",
    "purchasable": false,
    "linkCount": 0
  },
  "I0034": {
    "id": "I0034",
    "name": "여권 사본·여권용 사진 2매",
    "desc": "여권 분실 시 재발급 신청에 필요",
    "purchasable": false,
    "linkCount": 0
  },
  "I0035": {
    "id": "I0035",
    "name": "숙소 예약 바우처(오프라인 저장)",
    "desc": "입국심사에서 제시를 요구받을 수 있음",
    "purchasable": false,
    "linkCount": 0
  },
  "I0036": {
    "id": "I0036",
    "name": "왕복·제3국행 항공권 증빙",
    "desc": "편도 항공권만으로 입국이 거부되는 국가가 있음",
    "purchasable": false,
    "linkCount": 0
  },
  "I0037": {
    "id": "I0037",
    "name": "국제운전면허증",
    "desc": "발급에 시간이 걸리므로 출발 전 준비",
    "purchasable": false,
    "linkCount": 0
  },
  "I0038": {
    "id": "I0038",
    "name": "영문 처방전·의사 소견서",
    "desc": "처방약 통관과 기내 액체 예외 처리에 필요",
    "purchasable": false,
    "linkCount": 0
  },
  "I0039": {
    "id": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "desc": "현지에서 소액권으로 바꾸기 어려운 경우가 많음",
    "purchasable": false,
    "linkCount": 0
  },
  "I0040": {
    "id": "I0040",
    "name": "예비 신용카드(다른 브랜드 1장)",
    "desc": "카드 결제 거절·분실 대비",
    "purchasable": false,
    "linkCount": 0
  },
  "I0041": {
    "id": "I0041",
    "name": "전자 입국신고 QR 캡처",
    "desc": "국가별 사전 입국신고 시스템 제출 후 화면 저장",
    "purchasable": false,
    "linkCount": 0
  },
  "I0043": {
    "id": "I0043",
    "name": "동전 지갑",
    "desc": "동전 사용이 잦은 국가용",
    "purchasable": true,
    "linkCount": 0
  },
  "I0044": {
    "id": "I0044",
    "name": "볼펜",
    "desc": "종이 입국신고서·세관신고서 작성용",
    "purchasable": true,
    "linkCount": 0
  },
  "I0045": {
    "id": "I0045",
    "name": "오프라인 지도·번역 앱 다운로드",
    "desc": "데이터가 안 되거나 차단되는 곳 대비",
    "purchasable": false,
    "linkCount": 0
  },
  "I0046": {
    "id": "I0046",
    "name": "충전 케이블(기내용 짧은 것)",
    "desc": "기내 보조배터리 사용 금지에 대응",
    "purchasable": true,
    "linkCount": 0
  },
  "I0047": {
    "id": "I0047",
    "name": "배터리 절연테이프·개별 파우치",
    "desc": "2025년 9월부터 리튬배터리 절연 의무화",
    "purchasable": true,
    "linkCount": 0
  },
  "I0048": {
    "id": "I0048",
    "name": "멀티탭",
    "desc": "어댑터 1개로 여러 기기를 충전",
    "purchasable": true,
    "linkCount": 0
  },
  "I0049": {
    "id": "I0049",
    "name": "손전등·헤드랜턴",
    "purchasable": true,
    "linkCount": 0
  },
  "I0050": {
    "id": "I0050",
    "name": "노이즈캔슬링 이어폰·귀마개",
    "purchasable": true,
    "linkCount": 0
  },
  "I0051": {
    "id": "I0051",
    "name": "휴대용 선풍기",
    "desc": "프리볼트 충전식인지 확인",
    "purchasable": true,
    "linkCount": 0
  },
  "I0052": {
    "id": "I0052",
    "name": "여분 메모리카드·카드리더기",
    "purchasable": true,
    "linkCount": 0
  },
  "I0053": {
    "id": "I0053",
    "name": "카메라 여분 배터리",
    "desc": "리튬배터리는 위탁 금지, 기내 휴대만 가능",
    "purchasable": true,
    "linkCount": 0
  },
  "I0058": {
    "id": "I0058",
    "name": "변압기(220V 전용 발열기기용)",
    "desc": "무겁고 실패율이 높아 마지막 수단",
    "purchasable": true,
    "linkCount": 0
  },
  "I0061": {
    "id": "I0061",
    "name": "얇은 카디건·바람막이",
    "desc": "실내 냉방·일교차 대응",
    "purchasable": true,
    "linkCount": 0
  },
  "I0062": {
    "id": "I0062",
    "name": "편한 운동화",
    "purchasable": true,
    "linkCount": 0
  },
  "I0063": {
    "id": "I0063",
    "name": "슬리퍼·샌들",
    "purchasable": true,
    "linkCount": 0
  },
  "I0064": {
    "id": "I0064",
    "name": "래시가드",
    "desc": "자외선 차단 + 문신 가림 겸용",
    "purchasable": true,
    "linkCount": 0
  },
  "I0065": {
    "id": "I0065",
    "name": "챙 넓은 모자",
    "purchasable": true,
    "linkCount": 0
  },
  "I0066": {
    "id": "I0066",
    "name": "선글라스",
    "purchasable": true,
    "linkCount": 0
  },
  "I0067": {
    "id": "I0067",
    "name": "스카프·숄",
    "desc": "어깨·머리 가리개와 냉방 대비 겸용",
    "purchasable": true,
    "linkCount": 0
  },
  "I0068": {
    "id": "I0068",
    "name": "긴바지·롱스커트",
    "desc": "종교시설 복장 규정 대응",
    "purchasable": true,
    "linkCount": 0
  },
  "I0069": {
    "id": "I0069",
    "name": "발열내의(베이스레이어)",
    "desc": "면 소재는 땀이 마르지 않아 부적합",
    "purchasable": true,
    "linkCount": 0
  },
  "I0070": {
    "id": "I0070",
    "name": "두꺼운 스포츠 양말",
    "desc": "울·합성 소재, 면 금지",
    "purchasable": true,
    "linkCount": 0
  },
  "I0071": {
    "id": "I0071",
    "name": "수영모",
    "purchasable": true,
    "linkCount": 0
  },
  "I0072": {
    "id": "I0072",
    "name": "아쿠아슈즈·물놀이 신발",
    "purchasable": true,
    "linkCount": 0
  },
  "I0073": {
    "id": "I0073",
    "name": "우비·판초",
    "desc": "우산 사용이 어려운 곳 대응",
    "purchasable": true,
    "linkCount": 0
  },
  "I0074": {
    "id": "I0074",
    "name": "방수 재킷(레인셸)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0075": {
    "id": "I0075",
    "name": "넥워머·버프",
    "purchasable": true,
    "linkCount": 0
  },
  "I0076": {
    "id": "I0076",
    "name": "벗고 신기 쉬운 신발",
    "desc": "신발을 자주 벗는 문화권 대응",
    "purchasable": true,
    "linkCount": 0
  },
  "I0078": {
    "id": "I0078",
    "name": "포멀 의상(정장·드레스)",
    "desc": "드레스코드가 있는 자리 대응",
    "purchasable": false,
    "linkCount": 0
  },
  "I0079": {
    "id": "I0079",
    "name": "칼라 있는 셔츠(골프 드레스코드)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0080": {
    "id": "I0080",
    "name": "휴대용 티슈(포켓 티슈)",
    "desc": "화장실에 휴지가 없는 국가 대응",
    "purchasable": true,
    "linkCount": 0
  },
  "I0082": {
    "id": "I0082",
    "name": "지사제·정장제",
    "purchasable": true,
    "linkCount": 0
  },
  "I0084": {
    "id": "I0084",
    "name": "멀미약",
    "desc": "승선·승차 30분~1시간 전 복용",
    "purchasable": true,
    "linkCount": 0
  },
  "I0085": {
    "id": "I0085",
    "name": "밴드·소독약(상처 키트)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0086": {
    "id": "I0086",
    "name": "물집 예방 테이프",
    "desc": "마찰 부위에 미리 붙이는 용도",
    "purchasable": true,
    "linkCount": 0
  },
  "I0087": {
    "id": "I0087",
    "name": "KF94 마스크",
    "purchasable": true,
    "linkCount": 0
  },
  "I0088": {
    "id": "I0088",
    "name": "립밤",
    "purchasable": true,
    "linkCount": 0
  },
  "I0089": {
    "id": "I0089",
    "name": "보습제·인공눈물",
    "purchasable": true,
    "linkCount": 0
  },
  "I0090": {
    "id": "I0090",
    "name": "생리용품",
    "purchasable": true,
    "linkCount": 0
  },
  "I0091": {
    "id": "I0091",
    "name": "안경·여분 렌즈·렌즈 용액",
    "desc": "렌즈 용액은 100ml 이하만 기내 반입",
    "purchasable": false,
    "linkCount": 0
  },
  "I0092": {
    "id": "I0092",
    "name": "리프세이프(무기자차) 자외선차단제",
    "desc": "산화아연·이산화티타늄 성분",
    "purchasable": true,
    "linkCount": 0
  },
  "I0093": {
    "id": "I0093",
    "name": "벌레 물림 치료제",
    "purchasable": true,
    "linkCount": 0
  },
  "I0094": {
    "id": "I0094",
    "name": "핫팩",
    "purchasable": true,
    "linkCount": 0
  },
  "I0095": {
    "id": "I0095",
    "name": "말라리아 예방약",
    "desc": "출국 전 처방 필요",
    "purchasable": false,
    "linkCount": 0
  },
  "I0099": {
    "id": "I0099",
    "name": "지퍼백·비닐봉투",
    "purchasable": true,
    "linkCount": 0
  },
  "I0100": {
    "id": "I0100",
    "name": "접이식 보조가방(에코백)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0101": {
    "id": "I0101",
    "name": "속건 타월",
    "purchasable": true,
    "linkCount": 0
  },
  "I0105": {
    "id": "I0105",
    "name": "투명 가방(클리어백)",
    "desc": "페스티벌 반입 규정 대응",
    "purchasable": true,
    "linkCount": 0
  },
  "I0106": {
    "id": "I0106",
    "name": "돗자리",
    "purchasable": true,
    "linkCount": 0
  },
  "I0107": {
    "id": "I0107",
    "name": "접이식 의자",
    "purchasable": true,
    "linkCount": 0
  },
  "I0108": {
    "id": "I0108",
    "name": "보온병",
    "purchasable": true,
    "linkCount": 0
  },
  "I0109": {
    "id": "I0109",
    "name": "행동식(에너지바·견과)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0135": {
    "id": "I0135",
    "name": "골프 장갑",
    "desc": "대여 세트에 포함되지 않음",
    "purchasable": true,
    "linkCount": 0
  },
  "I0136": {
    "id": "I0136",
    "name": "골프화",
    "desc": "메탈 스파이크는 대부분 금지",
    "purchasable": true,
    "linkCount": 0
  },
  "I0137": {
    "id": "I0137",
    "name": "스키·보드 고글",
    "desc": "위생상 대여하지 않는 곳이 대부분",
    "purchasable": true,
    "linkCount": 0
  },
  "I0138": {
    "id": "I0138",
    "name": "방수 스키 장갑",
    "desc": "위생상 대여하지 않는 곳이 대부분",
    "purchasable": true,
    "linkCount": 0
  },
  "I0142": {
    "id": "I0142",
    "name": "문신 커버 씰",
    "desc": "방수·내열 타입, 엽서 크기까지만 실효",
    "purchasable": true,
    "linkCount": 0
  },
  "I0143": {
    "id": "I0143",
    "name": "머리끈",
    "purchasable": true,
    "linkCount": 0
  },
  "I0144": {
    "id": "I0144",
    "name": "침낭 라이너",
    "desc": "대여 침낭 위생 대비",
    "purchasable": true,
    "linkCount": 0
  },
  "I0146": {
    "id": "I0146",
    "name": "게이터(각반)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0147": {
    "id": "I0147",
    "name": "셀카봉",
    "desc": "반입·사용 금지 시설이 많음",
    "purchasable": true,
    "linkCount": 0
  },
  "I0148": {
    "id": "I0148",
    "name": "유아 간식·분유·이유식",
    "desc": "기내 액체 규정 예외 대상",
    "purchasable": true,
    "linkCount": 0
  },
  "I0149": {
    "id": "I0149",
    "name": "아기띠",
    "purchasable": false,
    "linkCount": 0
  },
  "I0150": {
    "id": "I0150",
    "name": "아이 상비약(해열제·체온계)",
    "desc": "아이 용량 제품은 현지 조달이 어려움",
    "purchasable": true,
    "linkCount": 0
  },
  "I0151": {
    "id": "I0151",
    "name": "부모님 편의용품(편한 신발·목베개)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0152": {
    "id": "I0152",
    "name": "반려동물 사료·배변봉투",
    "purchasable": true,
    "linkCount": 0
  },
  "I0153": {
    "id": "I0153",
    "name": "반려동물 검역증명서",
    "desc": "출국 최소 한 달 전 준비 시작",
    "purchasable": false,
    "linkCount": 0
  },
  "I0154": {
    "id": "I0154",
    "name": "목베개·안대",
    "purchasable": true,
    "linkCount": 0
  },
  "I0155": {
    "id": "I0155",
    "name": "충전기",
    "purchasable": true,
    "linkCount": 0
  },
  "I0156": {
    "id": "I0156",
    "name": "옷",
    "purchasable": true,
    "linkCount": 0
  },
  "I0157": {
    "id": "I0157",
    "name": "속옷",
    "purchasable": true,
    "linkCount": 0
  },
  "I0158": {
    "id": "I0158",
    "name": "양말",
    "purchasable": true,
    "linkCount": 0
  },
  "I0159": {
    "id": "I0159",
    "name": "작은 가방",
    "purchasable": true,
    "linkCount": 0
  },
  "I0160": {
    "id": "I0160",
    "name": "기초 화장품",
    "purchasable": true,
    "linkCount": 0
  },
  "I0161": {
    "id": "I0161",
    "name": "샤워 용품",
    "purchasable": true,
    "linkCount": 0
  },
  "I0162": {
    "id": "I0162",
    "name": "스노클 장비",
    "purchasable": true,
    "linkCount": 0
  },
  "I0163": {
    "id": "I0163",
    "name": "양산",
    "purchasable": true,
    "linkCount": 0
  },
  "I0164": {
    "id": "I0164",
    "name": "개인 식기·수저·컵",
    "purchasable": true,
    "linkCount": 0
  },
  "I0165": {
    "id": "I0165",
    "name": "등산 배낭",
    "desc": "당일 산행 기준 20~30L",
    "purchasable": true,
    "linkCount": 0
  },
  "I0166": {
    "id": "I0166",
    "name": "비상연락처 카드·위치공유 설정",
    "desc": "영사콜센터 +82-2-3210-0404",
    "purchasable": false,
    "linkCount": 0
  },
  "I0167": {
    "id": "I0167",
    "name": "도어스토퍼·휴대용 문잠금",
    "purchasable": true,
    "linkCount": 0
  },
  "I0168": {
    "id": "I0168",
    "name": "반려동물 리드줄·하네스·인식표",
    "purchasable": true,
    "linkCount": 0
  },
  "I0169": {
    "id": "I0169",
    "name": "알리페이·위챗페이 사전 등록",
    "desc": "출국 전 여권 실명인증까지",
    "purchasable": false,
    "linkCount": 0
  },
  "I0170": {
    "id": "I0170",
    "name": "데오드란트",
    "purchasable": true,
    "linkCount": 0
  },
  "I0171": {
    "id": "I0171",
    "name": "비자·입국 요건 확인",
    "desc": "출발 전 대사관 공지 재확인",
    "purchasable": false,
    "linkCount": 0
  },
  "I0172": {
    "id": "I0172",
    "name": "VPN 앱 사전 설치",
    "desc": "한국 로밍·해외 eSIM 사용 시 불필요",
    "purchasable": false,
    "linkCount": 0
  },
  "I0173": {
    "id": "I0173",
    "name": "압축 파우치",
    "purchasable": true,
    "linkCount": 0
  },
  "I0174": {
    "id": "I0174",
    "name": "손톱깎이·면봉 등 위생용품",
    "purchasable": true,
    "linkCount": 0
  },
  "I0175": {
    "id": "I0175",
    "name": "헤어캡(샤워캡)",
    "purchasable": true,
    "linkCount": 0
  },
  "I0176": {
    "id": "I0176",
    "name": "개인 수건",
    "purchasable": true,
    "linkCount": 0
  },
  "I0177": {
    "id": "I0177",
    "name": "신발 주머니",
    "purchasable": true,
    "linkCount": 0
  },
  "I0178": {
    "id": "I0178",
    "name": "환전",
    "desc": "현지 통화 소액 현금",
    "purchasable": false,
    "linkCount": 1
  }
};

export const SPEC_LINKS: SpecLink[] = [
  {
    "itemId": "I0031",
    "order": 1,
    "type": "info",
    "text": "현지에서 똑똑하게 카드 사용하는 방법",
    "url": "https://triple.guide/articles/22b8cee7-f99a-4a2e-8718-d24a1c1593ff"
  },
  {
    "itemId": "I0178",
    "order": 1,
    "type": "info",
    "text": "여행 전 똑똑하게 환전하기",
    "url": "https://triple.guide/articles/544a20bb-4d41-4ea5-a8bc-92c2c9127acf"
  },
  {
    "itemId": "I0032",
    "order": 1,
    "type": "info",
    "text": "해외 데이터 이용 방법",
    "url": "https://triple.guide/articles/7f36b99b-4adc-4153-8274-dfe24e26b3a7"
  },
  {
    "itemId": "I0032",
    "order": 2,
    "type": "booking",
    "text": "선불유심 예약하기",
    "url": "https://triple.guide/articles/1a6d8231-7a32-4d1d-ae54-230454024bad"
  },
  {
    "itemId": "I0032",
    "order": 3,
    "type": "booking",
    "text": "포켓와이파이 예약하기",
    "url": "https://triple.guide/articles/76fcf79e-5e62-48c0-a7b0-2ca6ca35525b"
  },
  {
    "itemId": "I0002",
    "order": 1,
    "type": "booking",
    "text": "여행자 보험 가입하기",
    "url": "https://triple.guide/articles/9f0deb5c-3f30-41aa-8382-54497be996f2"
  }
];

export const SPEC_DELETE_RATES: { activityId: string; itemId: string; rate: number; shown: boolean; exposure: number }[] = [];

export const SPEC_RULES = [
  {
    "itemId": "I0001",
    "name": "여권",
    "table": "essential"
  },
  {
    "itemId": "I0030",
    "name": "항공권(모바일 e-티켓)",
    "table": "essential"
  },
  {
    "itemId": "I0031",
    "name": "해외 결제 가능 카드",
    "reason": "결제 수단이 없으면 여행이 어려워요. 해외 사용 가능 카드인지 확인하세요",
    "table": "essential"
  },
  {
    "itemId": "I0032",
    "name": "eSIM 또는 로밍 데이터",
    "table": "essential"
  },
  {
    "itemId": "I0036",
    "name": "왕복·제3국행 항공권 증빙",
    "reason": "편도 항공권만으로 입국이 거부되는 나라가 있어요. 귀국편 e-티켓을 저장하세요",
    "table": "essential"
  },
  {
    "itemId": "I0178",
    "name": "환전",
    "reason": "카드가 안 되는 곳이 있어요. 현지 통화를 조금은 준비하세요",
    "table": "essential"
  },
  {
    "itemId": "I0002",
    "name": "여행자보험 증서(모바일)",
    "reason": "현지 병원비·분실 사고에 대비할 수 있어요",
    "table": "base"
  },
  {
    "itemId": "I0005",
    "name": "보조배터리",
    "reason": "2026년 4월부터 보조배터리는 1인 2개까지, 160Wh 이하만 가능해요. 위탁수하물에는 절대 넣을 수 없고 기내에서 몸에 지녀야 해요",
    "table": "base"
  },
  {
    "itemId": "I0047",
    "name": "배터리 절연테이프·개별 파우치",
    "reason": "2025년 9월부터 리튬배터리 단자 절연이 의무예요. 절연테이프를 붙이거나 하나씩 개별 파우치·지퍼백에 넣으세요",
    "table": "base"
  },
  {
    "itemId": "I0003",
    "name": "상비약(해열/진통/소화제)",
    "reason": "여행지에서 상비약을 못 구하면 낭패예요. 낱알로 옮기지 말고 원래 포장 그대로 가져가세요",
    "table": "base"
  },
  {
    "itemId": "I0029",
    "name": "기초 세면도구(칫솔·치약·클렌저 등)",
    "table": "base"
  },
  {
    "itemId": "I0034",
    "name": "여권 사본·여권용 사진 2매",
    "reason": "여권을 잃어버리면 재발급 신청에 사본과 사진이 필요해요. 클라우드에도 한 장 올려두세요",
    "table": "base"
  },
  {
    "itemId": "I0035",
    "name": "숙소 예약 바우처(오프라인 저장)",
    "reason": "입국심사에서 첫 숙소를 물어보는 경우가 있어요. 데이터가 안 될 때를 대비해 캡처해 두세요",
    "table": "base"
  },
  {
    "itemId": "I0046",
    "name": "충전 케이블(기내용 짧은 것)",
    "reason": "기내에서는 보조배터리를 못 써요. 좌석 USB에 꽂을 짧은 케이블이 필요해요",
    "table": "base"
  },
  {
    "itemId": "I0062",
    "name": "편한 운동화",
    "reason": "여행지에서는 하루 1만 보 이상 걷게 돼요. 새 신발보다 이미 길들여진 신발이 안전해요",
    "table": "base"
  },
  {
    "itemId": "I0085",
    "name": "밴드·소독약(상처 키트)",
    "reason": "작은 상처나 물집은 여행 중에 반드시 생겨요",
    "table": "base"
  },
  {
    "itemId": "I0091",
    "name": "안경·여분 렌즈·렌즈 용액",
    "reason": "현지에서 도수를 맞추기 어려워요. 렌즈 용액은 100ml 이하만 기내 반입돼요",
    "table": "base"
  },
  {
    "itemId": "I0099",
    "name": "지퍼백·비닐봉투",
    "reason": "젖은 옷·세면도구·전자기기를 분리하는 데 계속 쓰게 돼요",
    "table": "base"
  },
  {
    "itemId": "I0040",
    "name": "예비 신용카드(다른 브랜드 1장)",
    "reason": "카드 한 장이 갑자기 막히는 일이 흔해요. 다른 브랜드로 한 장 더 챙기세요",
    "table": "base"
  },
  {
    "itemId": "I0033",
    "name": "카메라",
    "reason": "폰 카메라로 충분한 여행도 많아요. 사진이 여행의 목적이라면 챙기세요",
    "table": "base"
  },
  {
    "itemId": "I0090",
    "name": "생리용품",
    "reason": "여행 일정과 겹칠 수 있어요. 브랜드가 익숙한 제품은 현지에서 구하기 어려워요",
    "table": "base"
  },
  {
    "itemId": "I0100",
    "name": "접이식 보조가방(에코백)",
    "reason": "쇼핑한 짐이나 하루 나들이용으로 유용해요. 접으면 부피가 거의 없어요",
    "table": "base"
  },
  {
    "itemId": "I0154",
    "name": "목베개·안대",
    "reason": "장거리 비행에서 잠을 조금이라도 자려면 있는 편이 나아요",
    "table": "base"
  },
  {
    "itemId": "I0155",
    "name": "충전기",
    "table": "base"
  },
  {
    "itemId": "I0156",
    "name": "옷",
    "table": "base"
  },
  {
    "itemId": "I0157",
    "name": "속옷",
    "reason": "세탁이 여의치 않을 수 있어요. 일수보다 조금 넉넉하게 챙기세요",
    "table": "base"
  },
  {
    "itemId": "I0158",
    "name": "양말",
    "table": "base"
  },
  {
    "itemId": "I0159",
    "name": "작은 가방",
    "table": "base"
  },
  {
    "itemId": "I0160",
    "name": "기초 화장품",
    "table": "base"
  },
  {
    "itemId": "I0161",
    "name": "샤워 용품",
    "table": "base"
  },
  {
    "itemId": "I0173",
    "name": "압축 파우치",
    "reason": "부피 큰 옷을 눌러 담으면 캐리어 한 칸이 남아요",
    "table": "base"
  },
  {
    "itemId": "I0174",
    "name": "손톱깎이·면봉 등 위생용품",
    "reason": "숙소에 없고 현지에서 사기도 애매한 자잘한 것들이에요",
    "table": "base"
  },
  {
    "itemId": "I0004",
    "name": "해외용 멀티 어댑터",
    "reason": "일본은 100V·A타입이라 한국 둥근 2핀이 안 들어가요. 돼지코가 꼭 필요해요",
    "table": "country",
    "countryId": "JP"
  },
  {
    "itemId": "I0043",
    "name": "동전 지갑",
    "reason": "자판기·코인로커·사찰 참배료가 대부분 동전이라 금방 쌓여요",
    "table": "country",
    "countryId": "JP"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "식권 발매기 라멘집, 노포, 사찰, 일부 버스는 아직 현금만 받아요",
    "table": "country",
    "countryId": "JP"
  },
  {
    "itemId": "I0038",
    "name": "영문 처방전·의사 소견서",
    "reason": "일반의약품은 2개월분, 처방약은 1개월분까지만 반입할 수 있어요. 1개월을 넘기면 약감증명이 필요한데 발급에 3주까지 걸려요",
    "table": "country",
    "countryId": "JP"
  },
  {
    "itemId": "I0027",
    "name": "전자담배·액상(휴대 여부 확인용)",
    "reason": "니코틴 액상은 일본에서 의약품이라 현지에서 살 수 없어요. 개인용 120ml까지 반입할 수 있으니 필요한 만큼 한국에서 챙기세요",
    "table": "country",
    "countryId": "JP"
  },
  {
    "itemId": "I0058",
    "name": "변압기(220V 전용 발열기기용)",
    "reason": "일본은 100V라 한국 220V 전용 고데기·드라이기는 제대로 안 돌아가요",
    "table": "country",
    "countryId": "JP"
  },
  {
    "itemId": "I0041",
    "name": "전자 입국신고 QR 캡처",
    "reason": "Visit Japan Web은 선택이에요. 미리 해두면 입국·세관 줄이 짧아져요",
    "table": "country",
    "countryId": "JP"
  },
  {
    "itemId": "I0044",
    "name": "볼펜",
    "reason": "Visit Japan Web을 안 했다면 기내에서 종이 서류를 써야 해요",
    "table": "country",
    "countryId": "JP"
  },
  {
    "itemId": "I0004",
    "name": "해외용 멀티 어댑터",
    "reason": "중국은 220V로 같지만 A·I타입이라 한국 둥근 2핀이 안 들어가요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0045",
    "name": "오프라인 지도·번역 앱 다운로드",
    "reason": "구글 지도·번역·유튜브가 차단돼요. 가오더 지도와 언어팩을 미리 받으세요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0080",
    "name": "휴대용 티슈(포켓 티슈)",
    "reason": "공중화장실에 휴지가 없는 곳이 아주 많아요. 포켓 티슈를 넉넉히 챙기세요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0027",
    "name": "전자담배·액상(휴대 여부 확인용)",
    "reason": "중국은 전자담배 기기 2대, 팟 6개, 액상 총 12ml까지만 허용돼요. 30ml 액상 한 병도 초과라 대부분 압수 대상이에요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0028",
    "name": "손소독제·개인 물티슈",
    "reason": "비누가 비치되지 않은 화장실이 많아요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0082",
    "name": "지사제·정장제",
    "reason": "수돗물을 마실 수 없고 음식이 안 맞는 경우가 많아요. 얼음과 생채소도 조심하세요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0087",
    "name": "KF94 마스크",
    "reason": "북부와 겨울철 미세먼지가 심해요. 호흡기가 약하면 꼭 챙기세요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0038",
    "name": "영문 처방전·의사 소견서",
    "reason": "에페드린이 든 감기약은 규제 대상이에요. 처방약은 영문 처방전과 함께 원래 포장 그대로 가져가세요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0041",
    "name": "전자 입국신고 QR 캡처",
    "reason": "2025년 11월부터 외국인 입국카드 온라인 제출이 시작됐어요. QR을 캡처해 두면 현지 네트워크가 불안정해도 괜찮아요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "알리페이·위챗페이가 압도적이에요. 현금은 여행 자금의 10%면 충분해요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0025",
    "name": "벌레기피제",
    "reason": "2026년 뎅기열 환자가 전년의 약 2배로 늘었고 성인 환자가 절반을 넘어요. 낮에 무는 모기라 주간에도 발라야 해요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0041",
    "name": "전자 입국신고 QR 캡처",
    "reason": "2026년 4월부터 베트남도 디지털 사전신고가 시작됐어요. 도착 72시간 이내에 prearrival.immigration.gov.vn에서 무료로 제출하세요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "길거리 음식·재래시장·쎄옴은 현금만 받아요. 큰 지폐는 미리 쪼개두세요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0027",
    "name": "전자담배·액상(휴대 여부 확인용)",
    "reason": "2025년 1월부터 전자담배 소지와 사용이 전면 금지예요. 관광객도 최대 200만 동 벌금과 압수 대상이에요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0080",
    "name": "휴대용 티슈(포켓 티슈)",
    "reason": "공중화장실에 휴지가 없거나 유료예요. 쓴 휴지는 옆 휴지통에 버려요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0082",
    "name": "지사제·정장제",
    "reason": "수돗물을 마실 수 없어요. 생고기와 생해산물은 피하는 게 좋아요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0038",
    "name": "영문 처방전·의사 소견서",
    "reason": "향정신성 의약품은 10일분, 마약류 성분은 7일분까지만 허용돼요. 태국보다 훨씬 엄격하니 최소량만 챙기세요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0093",
    "name": "벌레 물림 치료제",
    "reason": "모기에 물릴 일이 많아요. 긁어서 덧나는 걸 막아줘요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0073",
    "name": "우비·판초",
    "reason": "중부(다낭·호이안)는 10~11월에 태풍과 홍수가, 남부는 오후 스콜이 잦아요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0009",
    "name": "경량 패딩·방한복",
    "reason": "북부(하노이·하롱)의 12~2월은 생각보다 쌀쌀해요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0087",
    "name": "KF94 마스크",
    "reason": "하노이와 호치민의 대기오염이 심한 편이에요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0095",
    "name": "말라리아 예방약",
    "reason": "하노이·호치민·다낭·나트랑 등 주요 관광지는 말라리아 위험 지역이 아니에요",
    "table": "country",
    "countryId": "VN"
  },
  {
    "itemId": "I0025",
    "name": "벌레기피제",
    "reason": "뎅기열이 전국에 상재하고 우기(7~10월)에 정점이에요. 낮에 무는 모기라 주간에도 필요해요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0092",
    "name": "리프세이프(무기자차) 자외선차단제",
    "reason": "시밀란·피피 같은 해양국립공원은 옥시벤존·옥티녹세이트가 든 선크림을 쓰면 최대 10만 바트 벌금이에요. 산화아연·이산화티타늄 성분으로 바꿔 가세요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0041",
    "name": "전자 입국신고 QR 캡처",
    "reason": "2025년 5월부터 TDAC(태국 디지털 입국카드) 제출이 의무예요. 도착 72시간 이내에 tdac.immigration.go.th에서 무료로 하세요. 돈을 받는 사칭 사이트가 많으니 주소를 꼭 확인하세요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0068",
    "name": "긴바지·롱스커트",
    "reason": "왕궁·사원은 어깨·무릎은 물론 발목까지 가려야 하고 레깅스도 안 돼요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0027",
    "name": "전자담배·액상(휴대 여부 확인용)",
    "reason": "태국은 전자담배와 아이코스 반입이 불법이고 처벌이 가장 무거워요. 수입 위반은 최대 징역 10년 또는 벌금 50만 바트, 길거리 단속만으로도 2~3만 바트 벌금이에요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0004",
    "name": "해외용 멀티 어댑터",
    "reason": "전압은 220V로 같지만 A·B타입 콘센트만 있는 숙소가 흔해요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0080",
    "name": "휴대용 티슈(포켓 티슈)",
    "reason": "공중화장실에 휴지가 없고 물 분사기를 쓰는 곳이 많아요. 쓴 휴지는 옆 휴지통에 버려요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0082",
    "name": "지사제·정장제",
    "reason": "수돗물을 마실 수 없고 노점 음식은 위생 편차가 커요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0038",
    "name": "영문 처방전·의사 소견서",
    "reason": "의약품은 30일분까지예요. 코데인·모르핀 계열은 출발 2주 전 사전 허가와 세관 신고가 필요하고, 수면제·항불안제는 영문 처방전만 있으면 돼요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0073",
    "name": "우비·판초",
    "reason": "푸켓·끄라비는 5~10월, 사무이·팡안은 10~12월이 우기예요. 해안마다 반대예요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0087",
    "name": "KF94 마스크",
    "reason": "치앙마이 등 북부는 2~4월에 농업 소각으로 초미세먼지가 최악이에요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0095",
    "name": "말라리아 예방약",
    "reason": "방콕·치앙마이·푸켓 등 주요 관광지는 말라리아 위험 지역이 아니에요",
    "table": "country",
    "countryId": "TH"
  },
  {
    "itemId": "I0004",
    "name": "해외용 멀티 어댑터",
    "reason": "필리핀은 220V로 같지만 A·B타입(11자) 콘센트라 어댑터가 필요해요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0025",
    "name": "벌레기피제",
    "reason": "뎅기열이 최대 보건 위험이고 마닐라·세부 같은 도시에서도 발생해요. 유행기는 6~11월이에요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0041",
    "name": "전자 입국신고 QR 캡처",
    "reason": "eTravel 등록이 의무예요. 도착 72시간 이내에 etravel.gov.ph에서 무료로 하고 통화 신고도 함께 처리할 수 있어요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "섬 게스트하우스·트라이시클·재래시장은 현금만 받아요. 소액권을 확보하세요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0049",
    "name": "손전등·헤드랜턴",
    "reason": "정전(브라운아웃)이 잦아요. 계획 정전도 4~5시간이고 태풍 뒤에는 며칠씩 이어지기도 해요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0074",
    "name": "방수 재킷(레인셸)",
    "reason": "태풍 시즌이 6~11월, 정점이 7~10월이에요. 항공 지연과 페리 결항에 대비해 일정에 여유를 두세요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0082",
    "name": "지사제·정장제",
    "reason": "마닐라와 세부를 포함해 수돗물은 마실 수 없어요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0093",
    "name": "벌레 물림 치료제",
    "reason": "모기에 물릴 일이 많아요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0038",
    "name": "영문 처방전·의사 소견서",
    "reason": "체류 기간에 필요한 양만 허용돼요. 처방약은 병명과 용량이 적힌 영문 소견서를 함께 챙기세요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0027",
    "name": "전자담배·액상(휴대 여부 확인용)",
    "reason": "필리핀은 전자담배 반입이 합법이에요. 다만 태국·베트남·싱가포르를 경유한다면 그 나라 규정이 적용되니 조심하세요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0095",
    "name": "말라리아 예방약",
    "reason": "마닐라·세부·보라카이 등 일반 관광지는 말라리아 위험이 없어요. 팔라완 오지나 민다나오 농촌만 예방약을 고려하세요",
    "table": "country",
    "countryId": "PH"
  },
  {
    "itemId": "I0004",
    "name": "해외용 멀티 어댑터",
    "reason": "싱가포르는 영국식 Type G 콘센트(230V)를 사용해 어댑터가 꼭 필요해요",
    "table": "country",
    "countryId": "SG"
  },
  {
    "itemId": "I0027",
    "name": "전자담배·액상(휴대 여부 확인용)",
    "reason": "2026년 5월 1일 시행된 TVCA로 처벌이 크게 강해졌어요. 소지·사용만으로 최대 S$10,000, 반입은 최대 징역 9년에 벌금 S$300,000이에요. 위탁수하물에 넣어도 예외가 없어요",
    "table": "country",
    "countryId": "SG"
  },
  {
    "itemId": "I0038",
    "name": "영문 처방전·의사 소견서",
    "reason": "3개월분까지는 그대로 반입할 수 있지만 수면제·항불안제·ADHD약·코데인 감기약은 출발 2주 전 HSA 사전 승인이 필요해요. 처방전과 승인 메일을 함께 챙기세요",
    "table": "country",
    "countryId": "SG"
  },
  {
    "itemId": "I0061",
    "name": "얇은 카디건·바람막이",
    "reason": "바깥은 33도인데 쇼핑몰·MRT·식당 냉방이 20도 수준이에요",
    "table": "country",
    "countryId": "SG"
  },
  {
    "itemId": "I0041",
    "name": "전자 입국신고 QR 캡처",
    "reason": "SG Arrival Card는 전원 의무예요. 도착일 포함 3일 전부터만 제출할 수 있고 무료예요. 돈을 받는 대행 사이트를 조심하세요",
    "table": "country",
    "countryId": "SG"
  },
  {
    "itemId": "I0025",
    "name": "벌레기피제",
    "reason": "뎅기열이 연중 상존해요. 다만 말라리아는 없어요",
    "table": "country",
    "countryId": "SG"
  },
  {
    "itemId": "I0068",
    "name": "긴바지·롱스커트",
    "reason": "술탄 모스크 등 종교시설은 어깨와 무릎을 가려야 해요",
    "table": "country",
    "countryId": "SG"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "팁 문화가 없고 서비스차지·GST가 자동 청구돼요. 카드로 충분해요",
    "table": "country",
    "countryId": "SG"
  },
  {
    "itemId": "I0004",
    "name": "해외용 멀티 어댑터",
    "reason": "미국은 A·B타입(11자) 콘센트를 써요",
    "table": "country",
    "countryId": "US"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "팁이 필수예요. 하우스키핑·벨보이용 1달러 지폐를 20~30장 준비하세요",
    "table": "country",
    "countryId": "US"
  },
  {
    "itemId": "I0041",
    "name": "전자 입국신고 QR 캡처",
    "reason": "ESTA는 탑승 전에 받아야 해요. 2025년 9월 30일부터 수수료가 21달러에서 약 40달러로 올랐고, 여권을 재발급했다면 다시 신청해야 해요",
    "table": "country",
    "countryId": "US"
  },
  {
    "itemId": "I0058",
    "name": "변압기(220V 전용 발열기기용)",
    "reason": "미국은 120V라 220V 전용 고데기·드라이기는 고장 나요. 충전기는 괜찮아요",
    "table": "country",
    "countryId": "US"
  },
  {
    "itemId": "I0082",
    "name": "지사제·정장제",
    "reason": "미국 약은 성분·용량 체계가 달라요. 의료비도 비싸니 익숙한 약으로",
    "table": "country",
    "countryId": "US"
  },
  {
    "itemId": "I0061",
    "name": "얇은 카디건·바람막이",
    "reason": "여름에도 식당·극장·호텔 냉방이 매우 강해요",
    "table": "country",
    "countryId": "US"
  },
  {
    "itemId": "I0037",
    "name": "국제운전면허증",
    "reason": "도시를 벗어나면 렌터카가 전제예요. 도심만 다닌다면 필요 없어요",
    "table": "country",
    "countryId": "US"
  },
  {
    "itemId": "I0088",
    "name": "립밤",
    "reason": "덴버·산타페·국립공원 같은 고지대는 매우 건조해요",
    "table": "country",
    "countryId": "US"
  },
  {
    "itemId": "I0169",
    "name": "알리페이·위챗페이 사전 등록",
    "reason": "알리페이·위챗페이는 출국 전에 여권 실명인증과 카드 등록을 끝내두세요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0171",
    "name": "비자·입국 요건 확인",
    "reason": "한국 일반여권은 2026년 12월 31일까지 30일 무비자예요. 관광·상용·친지방문 등 5개 목적만 해당되고, 30일을 넘기거나 취업·유학이면 비자를 미리 받아야 해요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0172",
    "name": "VPN 앱 사전 설치",
    "reason": "현지 유심을 쓰면 구글·카톡이 막혀요. 중국에서는 VPN을 받을 수 없으니 출국 전에 설치하세요",
    "table": "country",
    "countryId": "CN"
  },
  {
    "itemId": "I0022",
    "name": "삼각대·짐벌",
    "table": "companion",
    "companionId": "solo"
  },
  {
    "itemId": "I0147",
    "name": "셀카봉",
    "table": "companion",
    "companionId": "solo"
  },
  {
    "itemId": "I0048",
    "name": "멀티탭",
    "reason": "한 방에서 여러 명이 충전하려면 어댑터 하나에 멀티탭을 물리는 게 제일 편해요",
    "table": "companion",
    "companionId": "friend"
  },
  {
    "itemId": "I0106",
    "name": "돗자리",
    "reason": "야외에서 다 같이 앉아 쉴 때 유용해요",
    "table": "companion",
    "companionId": "friend"
  },
  {
    "itemId": "I0147",
    "name": "셀카봉",
    "table": "companion",
    "companionId": "friend"
  },
  {
    "itemId": "I0022",
    "name": "삼각대·짐벌",
    "table": "companion",
    "companionId": "couple"
  },
  {
    "itemId": "I0078",
    "name": "포멀 의상(정장·드레스)",
    "reason": "기념일 디너나 드레스코드가 있는 레스토랑을 예약했다면 필요해요",
    "table": "companion",
    "companionId": "couple"
  },
  {
    "itemId": "I0147",
    "name": "셀카봉",
    "table": "companion",
    "companionId": "couple"
  },
  {
    "itemId": "I0022",
    "name": "삼각대·짐벌",
    "table": "companion",
    "companionId": "spouse"
  },
  {
    "itemId": "I0048",
    "name": "멀티탭",
    "reason": "둘이 쓰면 콘센트가 늘 부족해요",
    "table": "companion",
    "companionId": "spouse"
  },
  {
    "itemId": "I0078",
    "name": "포멀 의상(정장·드레스)",
    "reason": "드레스코드가 있는 레스토랑이나 공연을 예약했다면 필요해요",
    "table": "companion",
    "companionId": "spouse"
  },
  {
    "itemId": "I0019",
    "name": "기저귀·물티슈",
    "reason": "아이 동반 여행의 필수품이에요",
    "table": "companion",
    "companionId": "child"
  },
  {
    "itemId": "I0148",
    "name": "유아 간식·분유·이유식",
    "reason": "유아용 분유·이유식은 기내 액체 규정 예외예요. 검색대에 신고하세요",
    "table": "companion",
    "companionId": "child"
  },
  {
    "itemId": "I0150",
    "name": "아이 상비약(해열제·체온계)",
    "reason": "아이 용량에 맞는 해열제는 현지에서 구하기 어려워요. 체온계도 함께 챙기세요",
    "table": "companion",
    "companionId": "child"
  },
  {
    "itemId": "I0018",
    "name": "유모차",
    "reason": "아이와 장거리 이동 시 유모차가 있으면 훨씬 편해요",
    "table": "companion",
    "companionId": "child"
  },
  {
    "itemId": "I0149",
    "name": "아기띠",
    "reason": "유모차가 못 들어가는 좁은 골목, 계단, 대중교통이 생각보다 많아요",
    "table": "companion",
    "companionId": "child"
  },
  {
    "itemId": "I0021",
    "name": "부모님 개인 처방약",
    "reason": "평소 드시는 약은 현지에서 구할 수 없어요. 여유분과 영문 처방전을 함께 챙기세요",
    "table": "companion",
    "companionId": "parent"
  },
  {
    "itemId": "I0151",
    "name": "부모님 편의용품(편한 신발·목베개)",
    "reason": "하루 1만~2만 보를 걷게 돼요. 새 신발보다 평소 신던 신발이 안전해요",
    "table": "companion",
    "companionId": "parent"
  },
  {
    "itemId": "I0107",
    "name": "접이식 의자",
    "reason": "오래 서 계시기 힘들 수 있어요. 가벼운 접이식 의자가 있으면 좋아요",
    "table": "companion",
    "companionId": "parent"
  },
  {
    "itemId": "I0084",
    "name": "멀미약",
    "reason": "장거리 버스나 보트 이동이 있으면 미리 챙기세요",
    "table": "companion",
    "companionId": "parent"
  },
  {
    "itemId": "I0020",
    "name": "반려동물 이동장",
    "reason": "반려동반 여행은 항공사·현지 규정상 이동장이 꼭 필요해요",
    "table": "companion",
    "companionId": "pet"
  },
  {
    "itemId": "I0153",
    "name": "반려동물 검역증명서",
    "reason": "검역증명서와 광견병 예방접종 증명이 없으면 탑승 자체가 안 돼요. 국가별로 사전 신청 기간이 다르니 최소 한 달 전에 확인하세요",
    "table": "companion",
    "companionId": "pet"
  },
  {
    "itemId": "I0152",
    "name": "반려동물 사료·배변봉투",
    "reason": "현지에서 평소 먹던 사료를 구하기 어려워요. 갑작스러운 사료 변경은 배탈로 이어져요",
    "table": "companion",
    "companionId": "pet"
  },
  {
    "itemId": "I0166",
    "name": "비상연락처 카드·위치공유 설정",
    "reason": "사고가 나도 대신 알려줄 사람이 없어요. 가족과 실시간 위치를 공유하고 영사콜센터(+82-2-3210-0404)를 저장해 두세요",
    "table": "companion",
    "companionId": "solo"
  },
  {
    "itemId": "I0167",
    "name": "도어스토퍼·휴대용 문잠금",
    "reason": "혼자 묵는 숙소는 잠금장치를 믿기 어려워요. 문 안쪽에 하나 더 걸어두세요",
    "table": "companion",
    "companionId": "solo"
  },
  {
    "itemId": "I0168",
    "name": "반려동물 리드줄·하네스·인식표",
    "reason": "보안검색대에서는 이동장에서 꺼내 안고 통과해요. 놓치지 않게 하네스를 채우고 인식표에 현지 연락처를 적어 두세요",
    "table": "companion",
    "companionId": "pet"
  },
  {
    "itemId": "I0033",
    "name": "카메라",
    "reason": "사진 여행의 핵심이에요. 현지 대여는 언어와 보증금 장벽이 커요",
    "table": "activity",
    "activityId": "photo"
  },
  {
    "itemId": "I0053",
    "name": "카메라 여분 배터리",
    "reason": "저온·장시간 촬영에서 빨리 닳아요. 리튬배터리는 위탁 금지예요",
    "table": "activity",
    "activityId": "photo"
  },
  {
    "itemId": "I0052",
    "name": "여분 메모리카드·카드리더기",
    "reason": "카드가 손상되거나 꽉 차면 여행 중에는 복구할 방법이 없어요",
    "table": "activity",
    "activityId": "photo"
  },
  {
    "itemId": "I0022",
    "name": "삼각대·짐벌",
    "reason": "야경과 풍경을 안정적으로 찍어요. 삼각대를 금지하는 시설도 많아요",
    "table": "activity",
    "activityId": "photo"
  },
  {
    "itemId": "I0012",
    "name": "방수팩(드라이백)",
    "reason": "갑작스러운 비나 폭포·해변의 물보라에 대비할 수 있어요",
    "table": "activity",
    "activityId": "photo"
  },
  {
    "itemId": "I0049",
    "name": "손전등·헤드랜턴",
    "reason": "야간에 화장실을 가거나 설거지를 하려면 손이 자유로워야 해요",
    "table": "activity",
    "activityId": "camping"
  },
  {
    "itemId": "I0024",
    "name": "텐트·침낭",
    "reason": "한국·일본 캠핑장은 대부분 풀세트 렌탈이 있어요. 현지 대여가 나을 수 있어요",
    "table": "activity",
    "activityId": "camping"
  },
  {
    "itemId": "I0144",
    "name": "침낭 라이너",
    "reason": "대여 침낭의 위생이 신경 쓰일 때 유용하고 부피도 작아요",
    "table": "activity",
    "activityId": "camping"
  },
  {
    "itemId": "I0074",
    "name": "방수 재킷(레인셸)",
    "reason": "산간 캠핑장은 일교차가 크고 소나기가 잦아요",
    "table": "activity",
    "activityId": "camping"
  },
  {
    "itemId": "I0063",
    "name": "슬리퍼·샌들",
    "reason": "텐트를 드나들거나 샤워장에 갈 때 편해요",
    "table": "activity",
    "activityId": "camping"
  },
  {
    "itemId": "I0025",
    "name": "벌레기피제",
    "reason": "밤에 모기와 벌레가 몰려요",
    "table": "activity",
    "activityId": "camping"
  },
  {
    "itemId": "I0107",
    "name": "접이식 의자",
    "reason": "캠핑장 렌탈은 사이트당 개수 제한이 있는 경우가 많아요",
    "table": "activity",
    "activityId": "camping"
  },
  {
    "itemId": "I0108",
    "name": "보온병",
    "reason": "밤과 새벽에 따뜻한 음료가 있으면 체온 유지에 도움이 돼요",
    "table": "activity",
    "activityId": "camping"
  },
  {
    "itemId": "I0015",
    "name": "등산화",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0070",
    "name": "두꺼운 스포츠 양말",
    "reason": "면양말은 젖으면 마찰이 커져 물집이 생겨요. 울이나 합성 소재로 여분까지 챙기세요",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0086",
    "name": "물집 예방 테이프",
    "reason": "마찰이 생기는 부위에 미리 붙여두는 게 가장 확실한 예방이에요",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0049",
    "name": "손전등·헤드랜턴",
    "reason": "당일 산행이라도 하산이 늦어질 수 있어요",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0074",
    "name": "방수 재킷(레인셸)",
    "reason": "산 날씨는 급격히 바뀌어요",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0016",
    "name": "등산 스틱",
    "reason": "무릎 부담을 크게 줄여줘요. 기내 반입은 안 되니 위탁수하물에 넣으세요",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0109",
    "name": "행동식(에너지바·견과)",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0045",
    "name": "오프라인 지도·번역 앱 다운로드",
    "reason": "산에서는 데이터가 안 터져요. 코스 지도를 미리 내려받으세요",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0065",
    "name": "챙 넓은 모자",
    "reason": "고도가 100m 오를 때마다 자외선이 강해져요",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0146",
    "name": "게이터(각반)",
    "reason": "자갈, 눈, 진흙이 신발 안으로 들어오는 걸 막아줘요",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0135",
    "name": "골프 장갑",
    "reason": "사이즈가 개인마다 달라 대여 세트에 들어 있지 않아요. 부피도 없으니 2~3개 챙기세요",
    "table": "activity",
    "activityId": "golf"
  },
  {
    "itemId": "I0079",
    "name": "칼라 있는 셔츠(골프 드레스코드)",
    "reason": "해외 코스는 대부분 칼라 셔츠를 요구해요. 데님·티셔츠·샌들은 금지예요",
    "table": "activity",
    "activityId": "golf"
  },
  {
    "itemId": "I0017",
    "name": "골프 클럽(위탁수하물 별도 신고)",
    "reason": "해외 코스는 대부분 대여를 운영해요. 4회 이상 라운드가 아니면 대여가 나아요",
    "table": "activity",
    "activityId": "golf"
  },
  {
    "itemId": "I0136",
    "name": "골프화",
    "reason": "메탈 스파이크는 대부분 금지라 소프트 스파이크만 돼요. 일본은 대여도 돼요",
    "table": "activity",
    "activityId": "golf"
  },
  {
    "itemId": "I0011",
    "name": "자외선차단제",
    "reason": "동남아 라운드는 4.5~5.5시간 동안 그늘 없이 걸어요",
    "table": "activity",
    "activityId": "golf"
  },
  {
    "itemId": "I0065",
    "name": "챙 넓은 모자",
    "reason": "라운드 내내 햇볕을 그대로 받아요",
    "table": "activity",
    "activityId": "golf"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "동남아는 캐디가 필수 배정이고 캐디피와 팁을 현금으로 따로 줘요",
    "table": "activity",
    "activityId": "golf"
  },
  {
    "itemId": "I0073",
    "name": "우비·판초",
    "reason": "동남아는 오후 스콜이 잦아요",
    "table": "activity",
    "activityId": "golf"
  },
  {
    "itemId": "I0013",
    "name": "수영복",
    "reason": "물놀이 활동의 필수품이에요. 젖은 수영복을 다시 입지 않으려면 2벌이 좋아요",
    "table": "activity",
    "activityId": "swim"
  },
  {
    "itemId": "I0012",
    "name": "방수팩(드라이백)",
    "reason": "물놀이 중 휴대폰과 지갑을 안전하게 보관할 수 있어요",
    "table": "activity",
    "activityId": "swim"
  },
  {
    "itemId": "I0071",
    "name": "수영모",
    "reason": "일본, 프랑스, 한국의 공공 수영장은 수영모 착용이 사실상 의무예요",
    "table": "activity",
    "activityId": "swim"
  },
  {
    "itemId": "I0064",
    "name": "래시가드",
    "reason": "자외선 차단이 확실하고, 일본에서는 문신 가리개로도 쓸 수 있어요",
    "table": "activity",
    "activityId": "swim"
  },
  {
    "itemId": "I0072",
    "name": "아쿠아슈즈·물놀이 신발",
    "reason": "산호, 뜨거운 데크, 미끄러운 바닥에서 발을 보호해요",
    "table": "activity",
    "activityId": "swim"
  },
  {
    "itemId": "I0092",
    "name": "리프세이프(무기자차) 자외선차단제",
    "reason": "하와이, 팔라우, 태국 해양공원은 옥시벤존·옥티녹세이트가 든 선크림을 법으로 금지해요",
    "table": "activity",
    "activityId": "swim"
  },
  {
    "itemId": "I0014",
    "name": "물안경",
    "reason": "스노클링처럼 시야 확보가 필요할 때 유용해요",
    "table": "activity",
    "activityId": "swim"
  },
  {
    "itemId": "I0101",
    "name": "속건 타월",
    "reason": "부피가 작고 빨리 말라서 물놀이용으로 좋아요",
    "table": "activity",
    "activityId": "swim"
  },
  {
    "itemId": "I0142",
    "name": "문신 커버 씰",
    "reason": "일본 수영장과 워터파크는 큰 문신의 입장을 제한해요",
    "table": "activity",
    "activityId": "swim"
  },
  {
    "itemId": "I0073",
    "name": "우비·판초",
    "reason": "대기줄에서는 우산을 쓰기 어려워요. 파크 밖에서 미리 사면 훨씬 싸요",
    "table": "activity",
    "activityId": "themepark"
  },
  {
    "itemId": "I0147",
    "name": "셀카봉",
    "reason": "도쿄디즈니와 유니버설 스튜디오 재팬 모두 셀카봉·삼각대·일각대의 반입과 사용을 금지해요",
    "table": "activity",
    "activityId": "themepark"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "코인로커가 현금 전용인 곳이 많아요(도쿄디즈니 500~1,500엔)",
    "table": "activity",
    "activityId": "themepark"
  },
  {
    "itemId": "I0051",
    "name": "휴대용 선풍기",
    "reason": "여름 일본 놀이공원은 그늘이 거의 없어요",
    "table": "activity",
    "activityId": "themepark"
  },
  {
    "itemId": "I0094",
    "name": "핫팩",
    "reason": "겨울에는 줄을 서서 기다리는 시간이 길어요",
    "table": "activity",
    "activityId": "themepark"
  },
  {
    "itemId": "I0143",
    "name": "머리끈",
    "reason": "긴 머리는 물에 닿지 않게 묶는 것이 규칙이에요",
    "table": "activity",
    "activityId": "spa"
  },
  {
    "itemId": "I0142",
    "name": "문신 커버 씰",
    "reason": "문신이 있으면 입욕을 제한하는 곳이 많아요. 전신 문신은 대절탕을 예약하세요",
    "table": "activity",
    "activityId": "spa"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "입욕료, 코인로커, 자판기가 현금이나 동전인 곳이 많아요",
    "table": "activity",
    "activityId": "spa"
  },
  {
    "itemId": "I0089",
    "name": "보습제·인공눈물",
    "reason": "온천 후에는 피부가 많이 건조해져요",
    "table": "activity",
    "activityId": "spa"
  },
  {
    "itemId": "I0176",
    "name": "개인 수건",
    "reason": "료칸·대형 온천은 빌려주지만 소규모 시설은 없는 곳이 많아요",
    "table": "activity",
    "activityId": "spa"
  },
  {
    "itemId": "I0137",
    "name": "스키·보드 고글",
    "reason": "위생상 대여하지 않는 렌탈샵이 대부분이에요. 설맹과 눈보라에 대비해 꼭 본인 것을 챙기세요",
    "table": "activity",
    "activityId": "winter"
  },
  {
    "itemId": "I0138",
    "name": "방수 스키 장갑",
    "reason": "고글과 마찬가지로 위생상 대여가 안 되는 품목이에요",
    "table": "activity",
    "activityId": "winter"
  },
  {
    "itemId": "I0010",
    "name": "방한 모자·장갑",
    "reason": "활동 중 체온 유지에 필요해요",
    "table": "activity",
    "activityId": "winter"
  },
  {
    "itemId": "I0069",
    "name": "발열내의(베이스레이어)",
    "table": "activity",
    "activityId": "winter"
  },
  {
    "itemId": "I0070",
    "name": "두꺼운 스포츠 양말",
    "reason": "무릎 아래까지 오는 스키 전용 양말이어야 해요. 너무 두꺼우면 부츠가 발을 압박해요",
    "table": "activity",
    "activityId": "winter"
  },
  {
    "itemId": "I0011",
    "name": "자외선차단제",
    "reason": "눈에 반사된 자외선은 여름 해변만큼 강해요",
    "table": "activity",
    "activityId": "winter"
  },
  {
    "itemId": "I0088",
    "name": "립밤",
    "reason": "설면 반사와 찬 바람으로 입술이 금방 터요",
    "table": "activity",
    "activityId": "winter"
  },
  {
    "itemId": "I0075",
    "name": "넥워머·버프",
    "reason": "리프트를 타고 오르는 동안 얼굴이 가장 시려워요",
    "table": "activity",
    "activityId": "winter"
  },
  {
    "itemId": "I0094",
    "name": "핫팩",
    "reason": "장갑 안에 하나 넣어두면 손가락이 굳지 않아요",
    "table": "activity",
    "activityId": "winter"
  },
  {
    "itemId": "I0023",
    "name": "어깨·무릎 가리는 겉옷",
    "reason": "사원은 어깨와 무릎이 드러나는 옷의 입장을 제한하는 경우가 많아요",
    "table": "activity",
    "activityId": "temple"
  },
  {
    "itemId": "I0068",
    "name": "긴바지·롱스커트",
    "reason": "태국 왕궁은 발목까지 가려야 해요. 바티칸은 입구 노점에서 사야 해요",
    "table": "activity",
    "activityId": "temple"
  },
  {
    "itemId": "I0067",
    "name": "스카프·숄",
    "reason": "어깨와 머리를 동시에 가릴 수 있고 부피가 거의 없어요",
    "table": "activity",
    "activityId": "temple"
  },
  {
    "itemId": "I0076",
    "name": "벗고 신기 쉬운 신발",
    "reason": "사원과 모스크는 신발을 벗는 곳이 많아요. 끈 많은 운동화보다 슬립온이 훨씬 편해요",
    "table": "activity",
    "activityId": "temple"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "사롱 대여 보증금이나 시주에 소액 현금이 필요해요",
    "table": "activity",
    "activityId": "temple"
  },
  {
    "itemId": "I0105",
    "name": "투명 가방(클리어백)",
    "reason": "대형 페스티벌은 투명 가방 규정이 흔해요. 보통 30×15×30cm 이내예요",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0050",
    "name": "노이즈캔슬링 이어폰·귀마개",
    "reason": "청력 보호용 이어플러그는 현장에서도 팔지만 매진이 잦아요",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0073",
    "name": "우비·판초",
    "reason": "후지록을 비롯해 우산 사용을 전면 금지하는 페스티벌이 많아요",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0106",
    "name": "돗자리",
    "reason": "잔디와 벤치가 젖어 있는 경우가 많아요",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0049",
    "name": "손전등·헤드랜턴",
    "reason": "야간 이동에 필요할 수도 있어요",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0039",
    "name": "소액권 현금(팁·잔돈용)",
    "reason": "통신이 폭주하면 카드 결제가 안 돼요",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0080",
    "name": "휴대용 티슈(포켓 티슈)",
    "reason": "페스티벌 화장실에는 휴지가 없는 경우가 많아요",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0107",
    "name": "접이식 의자",
    "reason": "장시간 바닥에 앉아야 할 수도 있어서 없으면 많이 힘들어요",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0162",
    "name": "스노클 장비",
    "table": "activity",
    "activityId": "swim"
  },
  {
    "itemId": "I0066",
    "name": "선글라스",
    "table": "activity",
    "activityId": "themepark"
  },
  {
    "itemId": "I0107",
    "name": "접이식 의자",
    "table": "activity",
    "activityId": "themepark"
  },
  {
    "itemId": "I0163",
    "name": "양산",
    "reason": "페스티벌은 야외 운동장에서 진행되는 경우가 많아, 강한 햇빛과 자외선을 차단하기 위해 필요해요",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0065",
    "name": "챙 넓은 모자",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0066",
    "name": "선글라스",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0051",
    "name": "휴대용 선풍기",
    "table": "activity",
    "activityId": "festival"
  },
  {
    "itemId": "I0164",
    "name": "개인 식기·수저·컵",
    "reason": "캠핑장 매점이 없거나 일찍 닫는 곳이 많아요",
    "table": "activity",
    "activityId": "camping"
  },
  {
    "itemId": "I0165",
    "name": "등산 배낭",
    "reason": "물·행동식·여벌옷을 함께 메려면 20~30L는 필요해요",
    "table": "activity",
    "activityId": "hiking"
  },
  {
    "itemId": "I0066",
    "name": "선글라스",
    "reason": "페어웨이 반사광이 세서 눈이 금방 피로해져요",
    "table": "activity",
    "activityId": "golf"
  },
  {
    "itemId": "I0175",
    "name": "헤어캡(샤워캡)",
    "reason": "탕에 머리카락이 들어가지 않게 감싸요. 습식 사우나에서도 유용해요",
    "table": "activity",
    "activityId": "spa"
  },
  {
    "itemId": "I0177",
    "name": "신발 주머니",
    "reason": "벗은 신발을 직접 들고 들어가야 하는 사원이 많아요",
    "table": "activity",
    "activityId": "temple"
  },
  {
    "itemId": "I0011",
    "name": "자외선차단제",
    "reason": "맑은 날이 많아 자외선 노출이 커요",
    "table": "weather",
    "weatherId": "sunny"
  },
  {
    "itemId": "I0066",
    "name": "선글라스",
    "reason": "햇빛이 강하면 눈도 금방 피로해져요",
    "table": "weather",
    "weatherId": "sunny"
  },
  {
    "itemId": "I0065",
    "name": "챙 넓은 모자",
    "reason": "얼굴과 목뒤를 가려주면 자외선차단제를 덜 덧발라도 돼요",
    "table": "weather",
    "weatherId": "sunny"
  },
  {
    "itemId": "I0061",
    "name": "얇은 카디건·바람막이",
    "reason": "구름이 많으면 체감온도가 예보보다 낮게 느껴져요",
    "table": "weather",
    "weatherId": "cloudy"
  },
  {
    "itemId": "I0011",
    "name": "자외선차단제",
    "reason": "흐린 날에도 자외선은 그대로 내려와요",
    "table": "weather",
    "weatherId": "cloudy"
  },
  {
    "itemId": "I0075",
    "name": "넥워머·버프",
    "reason": "바람이 강하면 목과 얼굴이 가장 먼저 시려워요",
    "table": "weather",
    "weatherId": "windy"
  },
  {
    "itemId": "I0065",
    "name": "챙 넓은 모자",
    "reason": "바람이 강하면 자꾸 날아가요. 끈이 있거나 딱 맞는 모자가 나아요",
    "table": "weather",
    "weatherId": "windy"
  },
  {
    "itemId": "I0006",
    "name": "우산 또는 우비",
    "reason": "비 예보가 있어요. 우산이나 우비를 챙기세요",
    "table": "weather",
    "weatherId": "rain"
  },
  {
    "itemId": "I0012",
    "name": "방수팩(드라이백)",
    "reason": "비 오는 날 전자기기를 젖지 않게 보관할 수 있어요",
    "table": "weather",
    "weatherId": "rain"
  },
  {
    "itemId": "I0074",
    "name": "방수 재킷(레인셸)",
    "reason": "우산을 쓰기 어려운 이동이 많다면 방수 재킷이 더 편해요",
    "table": "weather",
    "weatherId": "rain"
  },
  {
    "itemId": "I0063",
    "name": "슬리퍼·샌들",
    "reason": "신발이 젖었을 때 갈아 신을 게 있으면 하루가 편해져요",
    "table": "weather",
    "weatherId": "rain"
  },
  {
    "itemId": "I0009",
    "name": "경량 패딩·방한복",
    "reason": "눈 예보가 있어요. 방한 장비가 필요해요",
    "table": "weather",
    "weatherId": "snow"
  },
  {
    "itemId": "I0010",
    "name": "방한 모자·장갑",
    "reason": "눈이 오면 손과 귀가 가장 먼저 시려워요",
    "table": "weather",
    "weatherId": "snow"
  },
  {
    "itemId": "I0070",
    "name": "두꺼운 스포츠 양말",
    "reason": "눈길에서는 발이 젖고 시려워요. 여분까지 챙기세요",
    "table": "weather",
    "weatherId": "snow"
  },
  {
    "itemId": "I0094",
    "name": "핫팩",
    "reason": "야외에 오래 있으면 손발이 금방 굳어요",
    "table": "weather",
    "weatherId": "snow"
  },
  {
    "itemId": "I0088",
    "name": "립밤",
    "reason": "눈에 반사된 자외선과 찬 바람으로 입술이 트기 쉬워요",
    "table": "weather",
    "weatherId": "snow"
  },
  {
    "itemId": "I0066",
    "name": "선글라스",
    "reason": "설면 반사가 생각보다 강해요",
    "table": "weather",
    "weatherId": "snow"
  },
  {
    "itemId": "I0163",
    "name": "양산",
    "reason": "그늘이 없는 구간에서 체감온도를 크게 낮춰줘요",
    "table": "weather",
    "weatherId": "sunny"
  },
  {
    "itemId": "I0009",
    "name": "경량 패딩·방한복",
    "reason": "예상 최저기온이 5도 미만이에요. 방한복이 필요해요",
    "table": "temp",
    "tempBandId": "cold"
  },
  {
    "itemId": "I0010",
    "name": "방한 모자·장갑",
    "reason": "낮은 기온에서 손과 귀를 보호해야 해요",
    "table": "temp",
    "tempBandId": "cold"
  },
  {
    "itemId": "I0069",
    "name": "발열내의(베이스레이어)",
    "reason": "겉옷을 한 겹 더 입는 것보다 내의 한 겹이 훨씬 따뜻해요",
    "table": "temp",
    "tempBandId": "cold"
  },
  {
    "itemId": "I0070",
    "name": "두꺼운 스포츠 양말",
    "reason": "발이 시리면 하루 종일 추워요",
    "table": "temp",
    "tempBandId": "cold"
  },
  {
    "itemId": "I0075",
    "name": "넥워머·버프",
    "reason": "목으로 들어오는 찬 바람만 막아도 체감온도가 달라져요",
    "table": "temp",
    "tempBandId": "cold"
  },
  {
    "itemId": "I0094",
    "name": "핫팩",
    "reason": "야외 일정이 길다면 몇 개 챙겨두면 좋아요",
    "table": "temp",
    "tempBandId": "cold"
  },
  {
    "itemId": "I0088",
    "name": "립밤",
    "reason": "찬 공기와 난방으로 입술이 금방 터요",
    "table": "temp",
    "tempBandId": "cold"
  },
  {
    "itemId": "I0089",
    "name": "보습제·인공눈물",
    "reason": "찬 공기와 실내 난방으로 피부가 많이 건조해져요",
    "table": "temp",
    "tempBandId": "cold"
  },
  {
    "itemId": "I0007",
    "name": "반팔 옷",
    "reason": "예상 최고기온이 26도 이상이에요. 통풍이 잘 되는 옷이 필요해요",
    "table": "temp",
    "tempBandId": "hot"
  },
  {
    "itemId": "I0011",
    "name": "자외선차단제",
    "reason": "높은 기온에서는 자외선과 땀 관리가 필요해요",
    "table": "temp",
    "tempBandId": "hot"
  },
  {
    "itemId": "I0065",
    "name": "챙 넓은 모자",
    "reason": "그늘이 없는 곳에서는 모자 하나로 체감이 크게 달라져요",
    "table": "temp",
    "tempBandId": "hot"
  },
  {
    "itemId": "I0066",
    "name": "선글라스",
    "reason": "햇빛이 강해 눈이 부셔요",
    "table": "temp",
    "tempBandId": "hot"
  },
  {
    "itemId": "I0051",
    "name": "휴대용 선풍기",
    "reason": "습도가 높으면 그늘에서도 땀이 계속 나요",
    "table": "temp",
    "tempBandId": "hot"
  },
  {
    "itemId": "I0061",
    "name": "얇은 카디건·바람막이",
    "reason": "바깥이 더울수록 실내 냉방이 강해요. 얇은 겉옷 하나는 꼭 챙기세요",
    "table": "temp",
    "tempBandId": "hot"
  },
  {
    "itemId": "I0063",
    "name": "슬리퍼·샌들",
    "reason": "통풍이 되는 신발이 있으면 훨씬 편해요",
    "table": "temp",
    "tempBandId": "hot"
  },
  {
    "itemId": "I0170",
    "name": "데오드란트",
    "reason": "습도까지 높으면 하루 만에 옷에 냄새가 배요",
    "table": "temp",
    "tempBandId": "hot"
  }
];
