// ============================================================
//  MATH MAYHEM — Question Bank
//  Topics: addition, multiplication, fractions, decimals,
//          algebra, geometry, word_problems
//  Levels: 1=Rookie, 2=Challenger, 3=Elite, 4=MAYHEM
// ============================================================

const QUESTIONS = {

  /* ──────────────────  ADDITION / SUBTRACTION  ────────────── */
  addition: [
    // Level 1
    { id:'a1', level:1, q:'What is 47 + 36?',         choices:['73','83','93','87'],         answer:'83',  type:'mc' },
    { id:'a2', level:1, q:'What is 125 − 58?',        choices:['57','67','77','47'],         answer:'67',  type:'mc' },
    { id:'a3', level:1, q:'What is 99 + 99?',         choices:['188','198','189','197'],     answer:'198', type:'mc' },
    { id:'a4', level:1, q:'What is 304 − 167?',       choices:['137','147','127','157'],     answer:'137', type:'mc' },
    { id:'a5', level:1, q:'True or False: 56 + 44 = 100', choices:['True','False'],          answer:'True',type:'tf'  },
    // Level 2
    { id:'a6', level:2, q:'What is 1,247 + 856?',     choices:['2,003','2,103','2,013','2,113'], answer:'2,103', type:'mc' },
    { id:'a7', level:2, q:'What is 5,000 − 2,345?',   choices:['2,655','2,755','2,545','2,645'], answer:'2,655', type:'mc' },
    { id:'a8', level:2, q:'True or False: 999 + 1 = 1,000', choices:['True','False'],        answer:'True', type:'tf' },
    { id:'a9', level:2, q:'What is 3,608 + 1,794?',   choices:['5,302','5,402','5,412','5,402'], answer:'5,402', type:'mc' },
    // Level 3
    { id:'a10',level:3, q:'What is −18 + 7?',         choices:['-11','11','-25','25'],       answer:'-11', type:'mc' },
    { id:'a11',level:3, q:'What is −34 − (−12)?',     choices:['-22','-46','22','46'],       answer:'-22', type:'mc' },
    // Level 4
    { id:'a12',level:4, q:'Evaluate: −47 + 89 − (−13)', choices:['55','65','75','45'],      answer:'55',  type:'mc' },
  ],

  /* ──────────────────  MULTIPLICATION / DIVISION  ────────────── */
  multiplication: [
    { id:'m1', level:1, q:'What is 7 × 8?',           choices:['54','56','58','64'],         answer:'56',  type:'mc' },
    { id:'m2', level:1, q:'What is 63 ÷ 9?',          choices:['6','7','8','9'],             answer:'7',   type:'mc' },
    { id:'m3', level:1, q:'What is 12 × 12?',         choices:['124','134','144','154'],     answer:'144', type:'mc' },
    { id:'m4', level:1, q:'What is 56 ÷ 7?',          choices:['6','7','8','9'],             answer:'8',   type:'mc' },
    { id:'m5', level:1, q:'True or False: 6 × 7 = 42',choices:['True','False'],              answer:'True',type:'tf'  },
    { id:'m6', level:2, q:'What is 24 × 15?',         choices:['360','340','380','300'],     answer:'360', type:'mc' },
    { id:'m7', level:2, q:'What is 144 ÷ 12?',        choices:['11','12','13','14'],         answer:'12',  type:'mc' },
    { id:'m8', level:2, q:'What is 36 × 25?',         choices:['800','900','850','950'],     answer:'900', type:'mc' },
    { id:'m9', level:2, q:'What is 256 ÷ 16?',        choices:['14','16','18','12'],         answer:'16',  type:'mc' },
    { id:'m10',level:3, q:'What is 48 × 37?',         choices:['1,666','1,776','1,876','1,676'],answer:'1,776',type:'mc' },
    { id:'m11',level:3, q:'What is 1,260 ÷ 28?',      choices:['40','42','45','48'],         answer:'45',  type:'mc' },
    { id:'m12',level:3, q:'True or False: 13 × 13 = 169', choices:['True','False'],          answer:'True',type:'tf'  },
    { id:'m13',level:4, q:'What is 125 × 48?',        choices:['5,900','6,000','6,100','5,800'],answer:'6,000',type:'mc' },
    { id:'m14',level:4, q:'What is 3,024 ÷ 63?',      choices:['46','48','50','52'],         answer:'48',  type:'mc' },
  ],

  /* ──────────────────  FRACTIONS  ────────────── */
  fractions: [
    { id:'f1', level:1, q:'What is ½ + ½?',            choices:['½','1','1½','2'],            answer:'1',   type:'mc' },
    { id:'f2', level:1, q:'What is ¾ − ¼?',            choices:['¼','½','¾','1'],             answer:'½',   type:'mc' },
    { id:'f3', level:1, q:'True or False: ⅔ > ½',      choices:['True','False'],              answer:'True',type:'tf'  },
    { id:'f4', level:2, q:'What is ⅔ + ¾?',            choices:['5/6','17/12','11/12','7/6'], answer:'17/12',type:'mc' },
    { id:'f5', level:2, q:'What is 2½ × 4?',           choices:['8','9','10','11'],           answer:'10',  type:'mc' },
    { id:'f6', level:2, q:'What is ⅗ of 45?',          choices:['25','27','30','35'],         answer:'27',  type:'mc' },
    { id:'f7', level:2, q:'Simplify: 12/18',            choices:['½','⅔','¾','⅗'],            answer:'⅔',   type:'mc' },
    { id:'f8', level:3, q:'What is 3¾ − 1⅗?',          choices:['2 3/20','2⅛','2 7/20','2¼'],answer:'2 3/20',type:'mc'},
    { id:'f9', level:3, q:'What is ⅗ ÷ ¾?',            choices:['4/5','9/20','20/9','5/4'],  answer:'4/5', type:'mc' },
    { id:'f10',level:3, q:'Convert 2⅗ to an improper fraction.', choices:['11/5','13/5','12/5','7/5'], answer:'13/5', type:'mc' },
    { id:'f11',level:4, q:'What is 2⅔ × 3¾?',          choices:['9','10','9⅔','10½'],        answer:'10',  type:'mc' },
    { id:'f12',level:4, q:'True or False: 7/8 > 13/16',choices:['True','False'],              answer:'True',type:'tf'  },
  ],

  /* ──────────────────  DECIMALS  ────────────── */
  decimals: [
    { id:'d1', level:1, q:'What is 3.5 + 2.7?',       choices:['5.2','6.0','6.2','6.5'],    answer:'6.2', type:'mc' },
    { id:'d2', level:1, q:'What is 9.8 − 4.3?',       choices:['4.5','5.0','5.5','5.3'],    answer:'5.5', type:'mc' },
    { id:'d3', level:1, q:'True or False: 0.5 = ½',   choices:['True','False'],              answer:'True',type:'tf'  },
    { id:'d4', level:2, q:'What is 4.7 × 3?',         choices:['12.1','13.1','14.1','14.7'],answer:'14.1',type:'mc' },
    { id:'d5', level:2, q:'What is 8.4 ÷ 4?',         choices:['1.2','2.0','2.1','2.4'],    answer:'2.1', type:'mc' },
    { id:'d6', level:2, q:'What is 12.6 + 9.75?',     choices:['22.35','22.30','21.35','22.45'],answer:'22.35',type:'mc' },
    { id:'d7', level:3, q:'What is 3.14 × 5?',        choices:['15.7','16.7','15.0','17.7'],answer:'15.7',type:'mc' },
    { id:'d8', level:3, q:'What is 15.75 ÷ 2.5?',     choices:['5.3','6.0','6.3','7.0'],    answer:'6.3', type:'mc' },
    { id:'d9', level:3, q:'Round 7.846 to the nearest hundredth.', choices:['7.84','7.85','7.8','7.9'], answer:'7.85', type:'mc' },
    { id:'d10',level:4, q:'What is 0.004 × 0.05?',    choices:['0.002','0.0002','0.02','0.00002'], answer:'0.0002', type:'mc' },
  ],

  /* ──────────────────  ALGEBRA  ────────────── */
  algebra: [
    { id:'al1',level:2, q:'If x + 7 = 15, what is x?',choices:['6','7','8','9'],             answer:'8',   type:'mc' },
    { id:'al2',level:2, q:'If 3x = 24, what is x?',   choices:['6','7','8','9'],             answer:'8',   type:'mc' },
    { id:'al3',level:2, q:'True or False: If 2x = 10, then x = 5.', choices:['True','False'],answer:'True',type:'tf'  },
    { id:'al4',level:3, q:'Solve: 2x + 5 = 17',       choices:['5','6','7','8'],             answer:'6',   type:'mc' },
    { id:'al5',level:3, q:'Solve: 4x − 3 = 21',       choices:['4','5','6','7'],             answer:'6',   type:'mc' },
    { id:'al6',level:3, q:'If y = 3x + 2 and x = 4, what is y?', choices:['12','14','16','18'], answer:'14', type:'mc' },
    { id:'al7',level:3, q:'What is the value of 5² − 3²?', choices:['10','16','20','34'],    answer:'16',  type:'mc' },
    { id:'al8',level:4, q:'Solve: 3(x − 4) = 15',     choices:['7','8','9','11'],            answer:'9',   type:'mc' },
    { id:'al9',level:4, q:'Solve for x: x/5 + 3 = 8', choices:['20','25','30','35'],         answer:'25',  type:'mc' },
    { id:'al10',level:4, q:'If f(x) = 2x² − 1 and x = 3, what is f(3)?', choices:['15','16','17','18'], answer:'17', type:'mc' },
    { id:'al11',level:4, q:'Solve: 2x + 3y = 12, x = 3. What is y?', choices:['1','2','3','4'], answer:'2', type:'mc' },
  ],

  /* ──────────────────  GEOMETRY  ────────────── */
  geometry: [
    { id:'g1', level:1, q:'How many sides does a hexagon have?', choices:['5','6','7','8'], answer:'6',    type:'mc' },
    { id:'g2', level:1, q:'What is the area of a square with side 5 cm?', choices:['10','20','25','30'],answer:'25',type:'mc' },
    { id:'g3', level:1, q:'True or False: A right angle is 90°.', choices:['True','False'],  answer:'True',type:'tf'  },
    { id:'g4', level:2, q:'What is the perimeter of a rectangle 8 cm × 5 cm?', choices:['26','28','30','40'],answer:'26',type:'mc' },
    { id:'g5', level:2, q:'What is the area of a triangle with base 10 and height 6?', choices:['30','40','60','80'],answer:'30',type:'mc' },
    { id:'g6', level:2, q:'How many degrees are in a triangle?', choices:['90','180','270','360'],answer:'180',type:'mc' },
    { id:'g7', level:3, q:'What is the circumference of a circle with radius 7? (Use π ≈ 3.14)', choices:['21.98','43.96','49.0','22.0'],answer:'43.96',type:'mc' },
    { id:'g8', level:3, q:'What is the area of a circle with radius 5? (Use π ≈ 3.14)', choices:['31.4','62.8','78.5','100'],answer:'78.5',type:'mc' },
    { id:'g9', level:3, q:'What is the volume of a rectangular prism 4×3×5?', choices:['40','50','60','70'],answer:'60',type:'mc' },
    { id:'g10',level:4, q:'A cylinder has height 10 and radius 3. What is its volume? (π ≈ 3.14)', choices:['282.6','94.2','188.4','314'],answer:'282.6',type:'mc' },
    { id:'g11',level:4, q:'True or False: All squares are rectangles.', choices:['True','False'], answer:'True', type:'tf' },
    { id:'g12',level:4, q:'What is the hypotenuse of a right triangle with legs 6 and 8?', choices:['10','11','12','14'],answer:'10',type:'mc' },
  ],

  /* ──────────────────  WORD PROBLEMS  ────────────── */
  word_problems: [
    { id:'w1', level:1, q:'Sara has 24 apples. She gives 8 to friends. How many remain?', choices:['14','16','18','20'],answer:'16',type:'mc' },
    { id:'w2', level:1, q:'A pizza is cut into 8 slices. Tom eats 3. What fraction is left?', choices:['⅜','½','⅝','¾'],answer:'⅝',type:'mc' },
    { id:'w3', level:2, q:'A store sells pens for $2.50 each. How much do 6 pens cost?', choices:['$12','$13.50','$15','$15.50'],answer:'$15',type:'mc' },
    { id:'w4', level:2, q:'A train travels 60 mph for 2.5 hours. How far does it go?', choices:['120 mi','140 mi','150 mi','160 mi'],answer:'150 mi',type:'mc' },
    { id:'w5', level:2, q:'A class has 30 students. 60% passed the test. How many passed?', choices:['14','16','18','20'],answer:'18',type:'mc' },
    { id:'w6', level:3, q:'A shirt costs $40 and is 25% off. What is the sale price?', choices:['$25','$28','$30','$32'],answer:'$30',type:'mc' },
    { id:'w7', level:3, q:'A recipe needs 2⅓ cups of flour per batch. How much for 3 batches?', choices:['6 cups','7 cups','7⅓ cups','6⅔ cups'],answer:'7 cups',type:'mc' },
    { id:'w8', level:3, q:'Mike earns $12/hr and works 35 hrs. After 20% tax, what does he take home?', choices:['$336','$350','$380','$420'],answer:'$336',type:'mc' },
    { id:'w9', level:4, q:'A pool fills in 4 hrs with one pipe, 6 hrs with another. Together, how long?', choices:['2 hrs','2.4 hrs','3 hrs','2.5 hrs'],answer:'2.4 hrs',type:'mc' },
    { id:'w10',level:4, q:'The sum of 3 consecutive integers is 75. What is the largest?', choices:['24','25','26','27'],answer:'26',type:'mc' },
    { id:'w11',level:4, q:'True or False: 15% of 200 is 30.', choices:['True','False'],        answer:'True',type:'tf'  },
  ]
};

// Flat array of all questions
const ALL_QUESTIONS = Object.values(QUESTIONS).flat();

// Utility: get random questions by topic + level
function getQuestions(topic = 'all', level = 1, count = 10) {
  let pool = topic === 'all' ? ALL_QUESTIONS : (QUESTIONS[topic] || ALL_QUESTIONS);
  pool = pool.filter(q => q.level <= level);
  // Shuffle
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Utility: get MAYHEM questions (all levels, all topics, shuffled)
function getMayhemQuestions(count = 15) {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Lightning round: 10 fast questions, level 2
function getLightningQuestions() {
  return getQuestions('all', 2, 10);
}

if (typeof module !== 'undefined') module.exports = { QUESTIONS, ALL_QUESTIONS, getQuestions, getMayhemQuestions, getLightningQuestions };
