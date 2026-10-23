// Major birth cities per country with longitude (degrees east) and IANA time zone.
// Longitude drives the local-mean-solar-time (진태양시) correction of the day and hour pillars.
// Row format: [English name, Korean name, longitude, zone override?, local-language name?]
const DATA = {
  KR: { zone: 'Asia/Seoul', rows: [
    ['Seoul', '서울', 126.98], ['Busan', '부산', 129.08], ['Daegu', '대구', 128.60], ['Incheon', '인천', 126.71], ['Gwangju', '광주', 126.85],
    ['Daejeon', '대전', 127.38], ['Ulsan', '울산', 129.31], ['Sejong', '세종', 127.29], ['Suwon', '수원', 127.03], ['Seongnam', '성남', 127.14],
    ['Goyang', '고양', 126.83], ['Yongin', '용인', 127.18], ['Bucheon', '부천', 126.78], ['Ansan', '안산', 126.83], ['Anyang', '안양', 126.95],
    ['Namyangju', '남양주', 127.22], ['Hwaseong', '화성', 126.83], ['Pyeongtaek', '평택', 127.11], ['Uijeongbu', '의정부', 127.03], ['Paju', '파주', 126.78],
    ['Gimpo', '김포', 126.72], ['Chuncheon', '춘천', 127.73], ['Wonju', '원주', 127.92], ['Gangneung', '강릉', 128.88], ['Sokcho', '속초', 128.59],
    ['Donghae', '동해', 129.11], ['Cheongju', '청주', 127.49], ['Chungju', '충주', 127.93], ['Jecheon', '제천', 128.19], ['Cheonan', '천안', 127.15],
    ['Asan', '아산', 127.00], ['Gongju', '공주', 127.12], ['Seosan', '서산', 126.45], ['Jeonju', '전주', 127.15], ['Gunsan', '군산', 126.74],
    ['Iksan', '익산', 126.96], ['Jeongeup', '정읍', 126.86], ['Namwon', '남원', 127.39], ['Mokpo', '목포', 126.39], ['Yeosu', '여수', 127.66],
    ['Suncheon', '순천', 127.49], ['Gwangyang', '광양', 127.70], ['Naju', '나주', 126.71], ['Pohang', '포항', 129.34], ['Gyeongju', '경주', 129.22],
    ['Andong', '안동', 128.73], ['Gumi', '구미', 128.34], ['Gimcheon', '김천', 128.11], ['Yeongju', '영주', 128.62], ['Sangju', '상주', 128.16],
    ['Changwon', '창원', 128.68], ['Masan', '마산', 128.57], ['Jinju', '진주', 128.08], ['Gimhae', '김해', 128.88], ['Yangsan', '양산', 129.04],
    ['Geoje', '거제', 128.62], ['Tongyeong', '통영', 128.43], ['Jeju', '제주', 126.53], ['Seogwipo', '서귀포', 126.56], ['Ulleung', '울릉', 130.90],
  ] },
  JP: { zone: 'Asia/Tokyo', rows: [
    ['Tokyo', '도쿄', 139.69, '', '東京'], ['Yokohama', '요코하마', 139.64, '', '横浜'], ['Osaka', '오사카', 135.50, '', '大阪'], ['Nagoya', '나고야', 136.91, '', '名古屋'],
    ['Sapporo', '삿포로', 141.35, '', '札幌'], ['Fukuoka', '후쿠오카', 130.40, '', '福岡'], ['Kobe', '고베', 135.20, '', '神戸'], ['Kyoto', '교토', 135.77, '', '京都'],
    ['Kawasaki', '가와사키', 139.70, '', '川崎'], ['Saitama', '사이타마', 139.65, '', 'さいたま'], ['Hiroshima', '히로시마', 132.46, '', '広島'], ['Sendai', '센다이', 140.87, '', '仙台'],
    ['Kitakyushu', '기타큐슈', 130.88, '', '北九州'], ['Chiba', '지바', 140.12, '', '千葉'], ['Niigata', '니가타', 139.04, '', '新潟'], ['Shizuoka', '시즈오카', 138.38, '', '静岡'],
    ['Okayama', '오카야마', 133.92, '', '岡山'], ['Kumamoto', '구마모토', 130.71, '', '熊本'], ['Kagoshima', '가고시마', 130.56, '', '鹿児島'], ['Naha', '나하(오키나와)', 127.68, '', '那覇'],
    ['Kanazawa', '가나자와', 136.66, '', '金沢'], ['Matsuyama', '마쓰야마', 132.77, '', '松山'], ['Nagasaki', '나가사키', 129.87, '', '長崎'], ['Hakodate', '하코다테', 140.73, '', '函館'],
    ['Aomori', '아오모리', 140.74, '', '青森'],
  ] },
  CN: { zone: 'Asia/Shanghai', rows: [
    ['Beijing', '베이징', 116.40, '', '北京'], ['Shanghai', '상하이', 121.47, '', '上海'], ['Guangzhou', '광저우', 113.26, '', '广州'], ['Shenzhen', '선전', 114.06, '', '深圳'],
    ['Tianjin', '톈진', 117.20, '', '天津'], ['Chongqing', '충칭', 106.55, '', '重庆'], ['Chengdu', '청두', 104.07, '', '成都'], ['Wuhan', '우한', 114.31, '', '武汉'],
    ["Xi'an", '시안', 108.94, '', '西安'], ['Nanjing', '난징', 118.80, '', '南京'], ['Hangzhou', '항저우', 120.16, '', '杭州'], ['Shenyang', '선양', 123.43, '', '沈阳'],
    ['Harbin', '하얼빈', 126.63, '', '哈尔滨'], ['Changchun', '창춘', 125.32, '', '长春'], ['Dalian', '다롄', 121.61, '', '大连'], ['Qingdao', '칭다오', 120.38, '', '青岛'],
    ['Jinan', '지난', 117.00, '', '济南'], ['Zhengzhou', '정저우', 113.63, '', '郑州'], ['Changsha', '창사', 112.94, '', '长沙'], ['Kunming', '쿤밍', 102.83, '', '昆明'],
    ['Xiamen', '샤먼', 118.09, '', '厦门'], ['Fuzhou', '푸저우', 119.30, '', '福州'], ['Hefei', '허페이', 117.23, '', '合肥'], ['Nanning', '난닝', 108.37, '', '南宁'],
    ['Haikou', '하이커우', 110.20, '', '海口'], ['Lanzhou', '란저우', 103.83, '', '兰州'], ['Taiyuan', '타이위안', 112.55, '', '太原'], ['Shijiazhuang', '스자좡', 114.51, '', '石家庄'],
    ['Hohhot', '후허하오터', 111.75, '', '呼和浩特'], ['Yanji', '옌지', 129.51, '', '延吉'], ['Urumqi', '우루무치', 87.62, '', '乌鲁木齐'], ['Lhasa', '라싸', 91.11, '', '拉萨'],
  ] },
  TW: { zone: 'Asia/Taipei', rows: [
    ['Taipei', '타이베이', 121.56, '', '台北'], ['New Taipei', '신베이', 121.47, '', '新北'], ['Taichung', '타이중', 120.68, '', '台中'], ['Kaohsiung', '가오슝', 120.30, '', '高雄'],
    ['Tainan', '타이난', 120.21, '', '台南'], ['Keelung', '지룽', 121.74, '', '基隆'], ['Hualien', '화롄', 121.60, '', '花蓮'],
  ] },
  HK: { zone: 'Asia/Hong_Kong', rows: [['Hong Kong', '홍콩', 114.17, '', '香港']] },
  MO: { zone: 'Asia/Macau', rows: [['Macau', '마카오', 113.54, '', '澳門']] },
  SG: { zone: 'Asia/Singapore', rows: [['Singapore', '싱가포르', 103.82]] },
  TH: { zone: 'Asia/Bangkok', rows: [
    ['Bangkok', '방콕', 100.50, '', 'กรุงเทพฯ'], ['Chiang Mai', '치앙마이', 98.99, '', 'เชียงใหม่'], ['Chiang Rai', '치앙라이', 99.83, '', 'เชียงราย'], ['Phuket', '푸껫', 98.39, '', 'ภูเก็ต'],
    ['Khon Kaen', '콘깬', 102.83, '', 'ขอนแก่น'], ['Udon Thani', '우돈타니', 102.79, '', 'อุดรธานี'], ['Nakhon Ratchasima', '나콘랏차시마', 102.10, '', 'นครราชสีมา'], ['Hat Yai', '핫야이', 100.47, '', 'หาดใหญ่'],
    ['Pattaya', '파타야', 100.88, '', 'พัทยา'], ['Ubon Ratchathani', '우본랏차타니', 104.86, '', 'อุบลราชธานี'], ['Surat Thani', '수랏타니', 99.33, '', 'สุราษฎร์ธานี'], ['Nakhon Si Thammarat', '나콘시탐마랏', 99.96, '', 'นครศรีธรรมราช'],
    ['Phitsanulok', '핏사눌록', 100.26, '', 'พิษณุโลก'], ['Nakhon Sawan', '나콘사완', 100.12, '', 'นครสวรรค์'], ['Hua Hin', '후아힌', 99.96, '', 'หัวหิน'], ['Ayutthaya', '아유타야', 100.57, '', 'อยุธยา'],
    ['Chonburi', '촌부리', 100.98, '', 'ชลบุรี'], ['Songkhla', '송클라', 100.59, '', 'สงขลา'],
  ] },
  VN: { zone: 'Asia/Ho_Chi_Minh', rows: [
    ['Hanoi', '하노이', 105.85, '', 'Hà Nội'], ['Ho Chi Minh City', '호찌민', 106.70, '', 'TP. Hồ Chí Minh'], ['Da Nang', '다낭', 108.22, '', 'Đà Nẵng'], ['Hai Phong', '하이퐁', 106.68, '', 'Hải Phòng'],
    ['Can Tho', '껀터', 105.78, '', 'Cần Thơ'], ['Hue', '후에', 107.59, '', 'Huế'], ['Nha Trang', '나트랑', 109.19, '', 'Nha Trang'], ['Vinh', '빈', 105.68, '', 'Vinh'],
    ['Quy Nhon', '꾸이년', 109.22, '', 'Quy Nhơn'], ['Da Lat', '달랏', 108.44, '', 'Đà Lạt'], ['Buon Ma Thuot', '부온마투옷', 108.05, '', 'Buôn Ma Thuột'], ['Bien Hoa', '비엔호아', 106.82, '', 'Biên Hòa'],
    ['Vung Tau', '붕따우', 107.08, '', 'Vũng Tàu'], ['Ha Long', '하롱', 107.08, '', 'Hạ Long'], ['Nam Dinh', '남딘', 106.17, '', 'Nam Định'], ['Thai Nguyen', '타이응우옌', 105.84, '', 'Thái Nguyên'],
    ['Long Xuyen', '롱쑤옌', 105.44, '', 'Long Xuyên'], ['Rach Gia', '락자', 105.08, '', 'Rạch Giá'], ['Phu Quoc', '푸꾸옥', 103.96, '', 'Phú Quốc'],
  ] },
  PH: { zone: 'Asia/Manila', rows: [
    ['Manila', '마닐라', 120.98], ['Quezon City', '퀘존시티', 121.04], ['Cebu', '세부', 123.89], ['Davao', '다바오', 125.61], ['Baguio', '바기오', 120.60],
    ['Iloilo', '일로일로', 122.56], ['Cagayan de Oro', '카가얀데오로', 124.63], ['Zamboanga', '잠보앙가', 122.08], ['Bacolod', '바콜로드', 122.95], ['Angeles', '앙헬레스', 120.59],
  ] },
  MY: { zone: 'Asia/Kuala_Lumpur', rows: [
    ['Kuala Lumpur', '쿠알라룸푸르', 101.69], ['Penang', '페낭', 100.33], ['Johor Bahru', '조호르바루', 103.76], ['Ipoh', '이포', 101.08], ['Malacca', '말라카', 102.25],
    ['Kota Bharu', '코타바루', 102.24], ['Kota Kinabalu', '코타키나발루', 116.07, 'Asia/Kuching'], ['Kuching', '쿠칭', 110.35, 'Asia/Kuching'],
  ] },
  ID: { zone: 'Asia/Jakarta', rows: [
    ['Jakarta', '자카르타', 106.85], ['Surabaya', '수라바야', 112.75], ['Bandung', '반둥', 107.61], ['Medan', '메단', 98.67], ['Semarang', '세마랑', 110.42],
    ['Yogyakarta', '족자카르타', 110.37], ['Palembang', '팔렘방', 104.76], ['Pontianak', '폰티아낙', 109.33, 'Asia/Pontianak'], ['Denpasar (Bali)', '덴파사르(발리)', 115.22, 'Asia/Makassar'],
    ['Makassar', '마카사르', 119.43, 'Asia/Makassar'], ['Balikpapan', '발릭파판', 116.83, 'Asia/Makassar'], ['Manado', '마나도', 124.84, 'Asia/Makassar'], ['Jayapura', '자야푸라', 140.72, 'Asia/Jayapura'],
  ] },
  IN: { zone: 'Asia/Kolkata', rows: [
    ['Delhi', '델리', 77.21], ['Mumbai', '뭄바이', 72.88], ['Kolkata', '콜카타', 88.36], ['Chennai', '첸나이', 80.27], ['Bengaluru', '벵갈루루', 77.59], ['Hyderabad', '하이데라바드', 78.49],
    ['Ahmedabad', '아마다바드', 72.57], ['Pune', '푸네', 73.86], ['Jaipur', '자이푸르', 75.79], ['Lucknow', '러크나우', 80.95], ['Guwahati', '구와하티', 91.74], ['Kochi', '코치', 76.27],
  ] },
  US: { zone: 'America/New_York', rows: [
    ['New York', '뉴욕', -74.01], ['Boston', '보스턴', -71.06], ['Philadelphia', '필라델피아', -75.17], ['Washington, D.C.', '워싱턴 D.C.', -77.04], ['Atlanta', '애틀랜타', -84.39],
    ['Miami', '마이애미', -80.19], ['Detroit', '디트로이트', -83.05, 'America/Detroit'], ['Chicago', '시카고', -87.63, 'America/Chicago'], ['Houston', '휴스턴', -95.37, 'America/Chicago'],
    ['Dallas', '댈러스', -96.80, 'America/Chicago'], ['Minneapolis', '미니애폴리스', -93.27, 'America/Chicago'], ['Denver', '덴버', -104.99, 'America/Denver'], ['Phoenix', '피닉스', -112.07, 'America/Phoenix'],
    ['Las Vegas', '라스베이거스', -115.14, 'America/Los_Angeles'], ['Los Angeles', '로스앤젤레스', -118.24, 'America/Los_Angeles'], ['San Diego', '샌디에이고', -117.16, 'America/Los_Angeles'],
    ['San Francisco', '샌프란시스코', -122.42, 'America/Los_Angeles'], ['San Jose', '새너제이', -121.89, 'America/Los_Angeles'], ['Seattle', '시애틀', -122.33, 'America/Los_Angeles'],
    ['Portland', '포틀랜드', -122.68, 'America/Los_Angeles'], ['Anchorage', '앵커리지', -149.90, 'America/Anchorage'], ['Honolulu', '호놀룰루', -157.86, 'Pacific/Honolulu'],
  ] },
  CA: { zone: 'America/Toronto', rows: [
    ['Toronto', '토론토', -79.38], ['Montreal', '몬트리올', -73.57], ['Ottawa', '오타와', -75.70], ['Halifax', '핼리팩스', -63.57, 'America/Halifax'], ['Winnipeg', '위니펙', -97.14, 'America/Winnipeg'],
    ['Calgary', '캘거리', -114.07, 'America/Edmonton'], ['Edmonton', '에드먼턴', -113.49, 'America/Edmonton'], ['Vancouver', '밴쿠버', -123.12, 'America/Vancouver'],
  ] },
  AU: { zone: 'Australia/Sydney', rows: [
    ['Sydney', '시드니', 151.21], ['Canberra', '캔버라', 149.13], ['Melbourne', '멜버른', 144.96, 'Australia/Melbourne'], ['Brisbane', '브리즈번', 153.03, 'Australia/Brisbane'],
    ['Gold Coast', '골드코스트', 153.43, 'Australia/Brisbane'], ['Perth', '퍼스', 115.86, 'Australia/Perth'], ['Adelaide', '애들레이드', 138.60, 'Australia/Adelaide'],
    ['Darwin', '다윈', 130.84, 'Australia/Darwin'], ['Hobart', '호바트', 147.33, 'Australia/Hobart'],
  ] },
  NZ: { zone: 'Pacific/Auckland', rows: [['Auckland', '오클랜드', 174.76], ['Wellington', '웰링턴', 174.78], ['Christchurch', '크라이스트처치', 172.64]] },
  GB: { zone: 'Europe/London', rows: [['London', '런던', -0.13], ['Manchester', '맨체스터', -2.24], ['Birmingham', '버밍엄', -1.90], ['Liverpool', '리버풀', -2.98], ['Edinburgh', '에든버러', -3.19], ['Glasgow', '글래스고', -4.25]] },
  DE: { zone: 'Europe/Berlin', rows: [['Berlin', '베를린', 13.40], ['Hamburg', '함부르크', 9.99], ['Munich', '뮌헨', 11.58], ['Frankfurt', '프랑크푸르트', 8.68], ['Cologne', '쾰른', 6.96]] },
  FR: { zone: 'Europe/Paris', rows: [['Paris', '파리', 2.35], ['Lyon', '리옹', 4.84], ['Marseille', '마르세유', 5.37]] },
};

const LOCAL_LANG = { JP: 'ja', CN: 'zh-CN', TW: 'zh-CN', HK: 'zh-CN', MO: 'zh-CN', TH: 'th', VN: 'vi' };

export function citiesForCountry(countryCode = '') {
  const code = String(countryCode).toUpperCase();
  const entry = DATA[code];
  if (!entry) return [];
  return entry.rows.map(([en, ko, longitude, zone, local]) => ({
    id: `${code}:${en}`, country: code, en, ko, local: local || '', localLang: LOCAL_LANG[code] || '', longitude, zone: zone || entry.zone,
  }));
}

export function findBirthCity(id = '') {
  const code = String(id).split(':')[0];
  return citiesForCountry(code).find(city => city.id === id) || null;
}

export function birthCityLabel(city, language = 'ko') {
  if (!city) return '';
  if (language === 'ko') return city.ko;
  if (city.local && city.localLang === language) return city.local;
  return city.en;
}

export function hasBirthCityList(countryCode = '') { return !!DATA[String(countryCode).toUpperCase()]; }
