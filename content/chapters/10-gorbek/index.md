# Görbék

A korábbi fejezetekben az alakzatok helyét többnyire közvetlen koordinátákkal adtuk meg. Görbék esetén a pontok koordinátáit **függvényekből is kiszámíthatjuk**. Ez nemcsak vonalak rajzolására használható: a görbe megadhatja egy mozgó objektum pályáját, vagy azt, hogy sok kisebb alakzat hova kerüljön egy kompozícióban.

Ebben a fejezetben a paraméteres leírás alapgondolatára és a felhasználására koncentrálunk. A függvények matematikai tulajdonságait nem vizsgáljuk részletesen; elsősorban a változtatható paraméterek és a keletkező kép kapcsolatát figyeljük meg.

## Paraméteres görbék {#parameteres-gorbek}

A síkbeli paraméteres görbe egy pontját két koordinátafüggvény határozza meg: `x(t)` és `y(t)`. A `t` egy változó, amelynek értékét egy megadott intervallumon végigvezetjük. Például egy kör esetében az `x(t) = R cos(t)` és `y(t) = R sin(t)` képleteket használhatjuk, ahol `t ∈ [0, 2π]` és `R` a kör sugara. Minden paraméterértékhez kiszámítunk egy pontot, majd az egymást követő pontokat összekötjük. Ha elég sok pontot számítunk, a vonal folyamatos görbének látszik.

A fejezetben a képletek mellett mindenhol megadjuk a **paramétertartományt** is. A `sin` és a `cos` a Processingben `sin()` és `cos()` formában szerepel; a `π` megfelelője a `PI`, a `2π` megfelelője a `TWO_PI`. Egy internetről talált új görbét is ugyanígy lehet kipróbálni: a képleteket átírjuk Processing-utasításokra, megadjuk a tartományt és szükség esetén az alakparamétereket.

**Általános rajzolóprogram.** A következő programban a `curveX()` és `curveY()` függvények, valamint a `tMin`, `tMax` értékek cserélhetők. A ciklus és a rajzolás szerkezete változatlan marad. Az első példa egy Lissajous-görbét rajzol. Ennek paraméteres leírása:

- `x(t) = A sin(a t)`
- `y(t) = B sin(b t + δ)`
- `t ∈ [0, 2π]`

Az `A` és `B` a vízszintes és függőleges kiterjedést, az `a` és `b` a két rezgés gyakoriságát, a `δ` (delta) pedig a fáziseltolást határozza meg. A példaprogramban `A = 240`, `B = 180`, `a = 3`, `b = 4`, `δ = π/2`.

:::processing-example title="Paraméteres görbe – újrahasználható 2D-s programváz" image="media/01-lissajous.webp"
```processing
float tMin = 0;
float tMax = TWO_PI;
int steps = 1200;

void setup() {
  size(800, 600);
  background(13, 20, 34);

  translate(width / 2, height / 2);
  noFill();
  stroke(110, 205, 245);
  strokeWeight(2);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, tMin, tMax);
    vertex(curveX(t), curveY(t));
  }
  endShape();
}

float curveX(float t) {
  return 240 * sin(3 * t);
}

float curveY(float t) {
  return 180 * sin(4 * t + PI / 2);
}
```
:::

A `map()` a ciklusváltozó `0` és `steps` közötti értékeit a megadott paramétertartományra képezi le. A `beginShape()` és az `endShape()` közötti `vertex(x, y)` hívások egymás után adják meg a görbe közelítő pontjait. A `steps` a mintavételezés sűrűségét szabályozza, tehát nem a görbe alakparamétere: kevés értéknél a vonal szögletesebb, több értéknél simább lesz. A két szinuszfüggvényben a `3`, `4` és a `PI / 2` a gyakoriságokat és a fáziseltolást adja meg; ezeket módosítva más Lissajous-mintát kapunk.

### Görbék különböző függvényekből

Néhány ismert görbén jól megfigyelhető, mennyire eltérő képet adhat ugyanaz a rajzolási módszer. Az alábbi kódok mind önálló programok, de mindegyik a fenti eljárást használja. A koordinátákat mindenhol az adott képletből számítjuk, a tartományt pedig a `map()` utolsó két paraméterében adjuk meg.

**Rózsagörbe.** A görbe polárkoordinátás leírása alapján először kiszámítjuk a középponttól mért távolságot, majd ebből a két koordinátát:

- `r(t) = A cos(k t)`
- `x(t) = r(t) cos(t)`, `y(t) = r(t) sin(t)`
- `t ∈ [0, 2π]`

A `k` határozza meg a szirmok elrendezését. Ha `k` páratlan egész szám, akkor `k` szirom keletkezik; páros egész `k` esetén `2k` szirom. A példában `A = 245`, `k = 7`.

:::processing-example title="Rózsagörbe – változtatható alakparaméter" image="media/02-rozsagorbe.webp"
```processing
float petals = 7;
int steps = 1400;

void setup() {
  size(800, 600);
  background(13, 20, 34);
  translate(width / 2, height / 2);

  noFill();
  stroke(245, 145, 185);
  strokeWeight(2);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, 0, TWO_PI);
    float r = 245 * cos(petals * t);
    float x = r * cos(t);
    float y = r * sin(t);
    vertex(x, y);
  }
  endShape();
}
```
:::

**Hipotrochoid.** Egy kisebb kör egy nagyobb kör **belső oldalán** gördül. Egy vele együtt mozgó pont pályáját rajzoljuk meg. Paraméteres egyenletei:

- `x(t) = (R − r) cos(t) + d cos(((R − r)/r) t)`
- `y(t) = (R − r) sin(t) − d sin(((R − r)/r) t)`
- `t ∈ [0, 4π]` az itt választott `R = 180`, `r = 40` értékeknél.

Az `R` a rögzített kör sugara, az `r` a gördülő kör sugara, a `d` pedig a rajzolópont távolsága a gördülő kör középpontjától. A példában `d = 105`, tehát a pont a kisebb körön kívül helyezkedik el. A tartományra figyelni kell: bizonyos sugárarányoknál a görbe egyetlen körbefordulás alatt nem záródik.

:::processing-example title="Hipotrochoid – három alakparaméterrel" image="media/03-hipotrochoid.webp"
```processing
float R = 180;
float r = 40;
float d = 105;
int steps = 1800;

void setup() {
  size(800, 600);
  background(13, 20, 34);
  translate(width / 2, height / 2);

  noFill();
  stroke(245, 196, 104);
  strokeWeight(2);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, 0, 2 * TWO_PI);
    float k = (R - r) / r;
    float x = (R - r) * cos(t) + d * cos(k * t);
    float y = (R - r) * sin(t) - d * sin(k * t);
    vertex(x, y);
  }
  endShape();
}
```
:::

**Epiciklois.** Most a kisebb kör a nagyobb kör **külső oldalán** gördül, a rajzolópont pedig a kisebb kör kerületén helyezkedik el. A csúcsokban találkozó ívek számát a két sugár aránya befolyásolja.

- `x(t) = (R + r) cos(t) − r cos(((R + r)/r) t)`
- `y(t) = (R + r) sin(t) − r sin(((R + r)/r) t)`
- `t ∈ [0, 2π]` az itt választott `R = 140`, `r = 35` értékeknél.

:::processing-example title="Epiciklois – külső körön gördülő kör" image="media/03b-epiciklois.webp"
```processing
float R = 140;
float r = 35;
int steps = 1600;

void setup() {
  size(800, 600);
  background(13, 20, 34);
  translate(width / 2, height / 2);

  noFill();
  stroke(125, 210, 250);
  strokeWeight(2);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, 0, TWO_PI);
    float k = (R + r) / r;
    float x = (R + r) * cos(t) - r * cos(k * t);
    float y = (R + r) * sin(t) - r * sin(k * t);
    vertex(x, y);
  }
  endShape();
}
```
:::

**Epitrochoid.** A gördülés itt is a nagyobb kör külső oldalán történik, de a rajzolópont már nem feltétlenül a kisebb kör kerületén van. A pont távolságát a kisebb kör középpontjától a `d` paraméter adja meg.

- `x(t) = (R + r) cos(t) − d cos(((R + r)/r) t)`
- `y(t) = (R + r) sin(t) − d sin(((R + r)/r) t)`
- `t ∈ [0, 2π]` az itt választott `R = 140`, `r = 35` értékeknél.

Ha `d = r`, ugyanazt az epicikloist kapjuk, mint az előző példában. Ha `d` ettől eltér, az alakja is változik. A programban `d = 85`, ezért hurkolt mintát rajzolunk.

:::processing-example title="Epitrochoid – változó rajzolópont" image="media/03c-epitrochoid.webp"
```processing
float R = 140;
float r = 35;
float d = 85;
int steps = 1600;

void setup() {
  size(800, 600);
  background(13, 20, 34);
  translate(width / 2, height / 2);

  noFill();
  stroke(245, 158, 130);
  strokeWeight(2);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, 0, TWO_PI);
    float k = (R + r) / r;
    float x = (R + r) * cos(t) - d * cos(k * t);
    float y = (R + r) * sin(t) - d * sin(k * t);
    vertex(x, y);
  }
  endShape();
}
```
:::

A hipotrochoid, az epiciklois és az epitrochoid esetében érdemes a `R`, `r` és `d` értékeket külön-külön változtatni. A programváz mindig ugyanaz marad, de a rajz jelentősen átalakulhat. **Nem minden paraméterválasztásnál zárt a görbe a megadott tartományon**: ha csak a görbe egy részét látjuk, először a `tMax` értékét érdemes növelni.

**Archimédészi spirál.** A sugár a paraméterrel arányosan nő:

- `r(t) = a t`
- `x(t) = a t cos(t)`, `y(t) = a t sin(t)`
- `t ∈ [0, 2π · turns]`

Az `a` értékének a programban a `growth` változó felel meg: azt mutatja, milyen gyorsan távolodunk a középponttól. A `turns` a körbefordulások száma. Ha valamelyik paramétert módosítjuk, más méretű vagy sűrűségű spirált kapunk.

:::processing-example title="Archimédészi spirál" image="media/04-spiral.webp"
```processing
int turns = 7;
float growth = 5.2;
int steps = 1800;

void setup() {
  size(800, 600);
  background(13, 20, 34);
  translate(width / 2, height / 2);

  noFill();
  stroke(118, 220, 178);
  strokeWeight(2);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, 0, turns * TWO_PI);
    float r = growth * t;
    vertex(r * cos(t), r * sin(t));
  }
  endShape();
}
```
:::

Az itt bemutatott görbéknél érdemes először csak egy-egy paramétert módosítani, és megnézni, hogyan változik a görbe. A kódban a számításokat nem kell levezetnünk: azt kell érteni, **melyik paramétert változtatjuk, és az hogyan hat a rajzra**.

## Görbék alkalmazása {#alkalmazasok}

A görbe pontjaihoz nemcsak vonalszakaszokat rajzolhatunk. Ugyanezekre a koordinátákra köröket, négyzeteket vagy képeket is helyezhetünk. A `t` paraméter akár a rajzolt alakzat méretét, forgatását és színét is szabályozhatja.

**Alakzatok elhelyezése.** Az első program egy Lissajous-görbe mentén színes köröket rajzol. A pálya képletei a korábbi példával azonosak (`x(t) = 240 sin(3t)` és `y(t) = 180 sin(4t + π/2)`, ahol `t ∈ [0, 2π]`). A körök méretét a `diameter = 5 + 9 · (1 + sin(7t))/2` kifejezés határozza meg, ezért a pontok különböző nagyságúak lesznek. A színük a `fill()` paramétereiben változik; a negyedik szám az áttetszőséget adja meg.

:::processing-example title="Változó méretű körök egy görbe mentén" image="media/05-korok-gorben.webp"
```processing
void setup() {
  size(800, 600);
  background(13, 20, 34);
  translate(width / 2, height / 2);
  noStroke();

  int count = 180;
  for (int i = 0; i < count; i++) {
    float t = map(i, 0, count, 0, TWO_PI);
    float x = 240 * sin(3 * t);
    float y = 180 * sin(4 * t + PI / 2);
    float diameter = 5 + 9 * (1 + sin(7 * t)) / 2;

    fill(95 + 120 * i / count,
         145 + 65 * sin(t), 230, 170);
    circle(x, y, diameter);
  }
}
```
:::

**Forgatott négyzetek.** Most egy ellipszisre helyezzük a négyzetek középpontját: `x(t) = 235 cos(t)`, `y(t) = 170 sin(t)`, ahol `t ∈ [0, 2π]`. A korábban tanult `pushMatrix()` és `popMatrix()` biztosítja, hogy minden négyzet saját helyen és szögben rajzolódjon ki. A `rotate(2 * t)` a négyzetet a körbejárás során kétszer forgatja meg, a `scale(s)` pedig a méretét változtatja. Itt `s(t) = 0.7 + 0.35 sin(5t)`, ezért a méret periodikusan nő és csökken. A transzformációkat a rajzolás után visszaállítjuk, így nem halmozódnak fel a következő négyzetnél.

:::processing-example title="A görbe mentén forgó és méretezett négyzetek" image="media/06-negyzetek-gorben.webp"
```processing
void setup() {
  size(800, 600);
  background(13, 20, 34);
  rectMode(CENTER);
  noFill();
  strokeWeight(2);
  translate(width / 2, height / 2);

  int count = 120;
  for (int i = 0; i < count; i++) {
    float t = map(i, 0, count, 0, TWO_PI);
    float x = 235 * cos(t);
    float y = 170 * sin(t);
    float s = 0.7 + 0.35 * sin(5 * t);

    pushMatrix();
    translate(x, y);
    rotate(2 * t);
    scale(s);
    stroke(110 + i, 180, 245, 170);
    rect(0, 0, 34, 34);
    popMatrix();
  }
}
```
:::

A négyzetek nem egyetlen kész alakzat másolatai a képen: minden cikluslépésben újból meghatározzuk a helyüket, méretüket és irányukat. Ugyanez az eljárás alkalmazható képek elhelyezésére is az `image()` rajzoló utasítással.

**Kontrollpontokkal megadott görbék.** Nem minden esetben szeretnénk a koordinátafüggvényeket kézzel megadni. A Bézier-görbéknél a görbe alakját **kontrollpontokkal** befolyásoljuk. A harmadfokú Bézier-görbe négy kontrollpontja közül az első és az utolsó a görbe végpontja; a két közbenső pont a görbe indulásának és érkezésének irányát, valamint a görbe alakját befolyásolja. A négy pontot sorrendben összekötő törött vonal a **kontrollpoligon**. A görbe általában nem halad át a két belső kontrollponton.

A Processing `bezier()` metódusa ezeket a pontokat fogadja. A következő példában a teljes kontrollpoligont is megrajzoljuk, és az egyik belső kontrollpont az egérrel mozgatható. Így közvetlenül összehasonlítható a kontrollpoligon és a keletkező görbe.

:::processing-example title="Bézier-görbe mozgatható kontrollponttal" image="media/07-bezier.webp"
```processing
void setup() {
  size(800, 550);
  strokeWeight(3);
}

void draw() {
  background(16, 25, 40);

  stroke(86, 110, 135);
  strokeWeight(1);
  line(90, 420, 260, 110);
  line(260, 110, mouseX, mouseY);
  line(mouseX, mouseY, 710, 120);

  noFill();
  stroke(105, 215, 215);
  strokeWeight(4);
  bezier(90, 420,
         260, 110,
         mouseX, mouseY,
         710, 120);

  noStroke();
  fill(90, 205, 245);
  circle(90, 420, 14);
  circle(710, 120, 14);

  fill(250, 175, 100);
  circle(260, 110, 14);
  circle(mouseX, mouseY, 14);
}
```
:::

A kék pontok a görbe végpontjai, a narancssárgák a két belső kontrollpontot jelölik. A szürke törött vonal mindhárom szakasza együtt alkotja a kontrollpoligont. A `curve()` és a `curveVertex()` egy másik, Catmull–Rom-típusú interpolációs görbéhez használható. Ezeket most nem vezetjük le; a kontrollpontok szerepének megértése elegendő.

## Térbeli görbék {#terbeli-gorbek}

Térben ugyanaz a módszer működik, mint síkban, csak a pontnak **harmadik koordinátája is van**. A görbe egy pontját így `x(t)`, `y(t)` és `z(t)` határozza meg. A `P3D` megjelenítési módot használjuk, és a `vertex()` már három értéket kap. A `rotateX()` és `rotateY()` nem változtatják meg a görbe képletét: a teljes koordinátarendszert forgatják, hogy a térbeli forma több oldalról is látszódjon.

**Általános térbeli programváz.** A következő program egy csavarvonalat rajzol. A térbeli görbe alakja a három `curveX()`, `curveY()` és `curveZ()` függvény, valamint a paramétertartomány cseréjével változtatható. Ennek a csavarvonalnak az egyenletei:

- `x(t) = R cos(t)`, `y(t) = R sin(t)`
- `z(t) = z0 + h t`
- `t ∈ [0, 6π]`

A programban `R = 135`, `z0 = −210`, `h = 22`. Az `R` a csavarvonal sugara, a `h` pedig azt szabályozza, milyen gyorsan változik a magasság a paraméter növelésével.

:::processing-example title="Csavarvonal – újrahasználható 3D-s programváz" image="media/08-csavarvonal.webp"
```processing
float tMin = 0;
float tMax = 6 * PI;
int steps = 1200;

void setup() {
  size(850, 600, P3D);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.6);
  rotateY(frameCount * 0.006);

  noFill();
  stroke(110, 215, 245);
  strokeWeight(3);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, tMin, tMax);
    vertex(curveX(t), curveY(t), curveZ(t));
  }
  endShape();
}

float curveX(float t) { return 135 * cos(t); }
float curveY(float t) { return 135 * sin(t); }
float curveZ(float t) { return -210 + 22 * t; }
```
:::

A `curveX()` és `curveY()` körmozgást írnak le, miközben a `curveZ()` folyamatosan változik; ettől alakul ki a csavarvonal. A teljes jelenetet lassan forgatjuk, hogy a térbeli forma könnyebben áttekinthető legyen.

**Tóruszcsomó.** Egy térben önmagába visszatérő görbét is létrehozhatunk. A paraméteres egyenletek például így adhatók meg:

- `x(t) = (R + r cos(qt)) cos(pt)`
- `y(t) = (R + r cos(qt)) sin(pt)`
- `z(t) = r sin(qt)`
- `t ∈ [0, 2π]`

A `R` a nagyobb körsugár, az `r` a kisebb, a `p` és `q` pedig azt határozza meg, hány fordulatot végez a görbe a tórusz két alapvető iránya körül. A programban `R = 180`, `r = 68`, `p = 2`, `q = 3`. A program nem egy tóruszfelületet rajzol, hanem egyetlen térbeli vonalat.

:::processing-example title="Tóruszcsomó – térbeli görbe alakparaméterekkel" image="media/09-toruszcsomo.webp"
```processing
float p = 2;
float q = 3;
int steps = 1500;

void setup() {
  size(850, 600, P3D);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.5);
  rotateY(frameCount * 0.005);
  noFill();
  stroke(245, 155, 190);
  strokeWeight(3);

  beginShape();
  for (int i = 0; i <= steps; i++) {
    float t = map(i, 0, steps, 0, TWO_PI);
    float a = 180 + 68 * cos(q * t);
    float x = a * cos(p * t);
    float y = a * sin(p * t);
    float z = 68 * sin(q * t);
    vertex(x, y, z);
  }
  endShape();
}
```
:::

A térbeli görbe mentén gömböket is elhelyezhetünk. A következő programban az egyes gömbök helyét ugyanaz a tóruszcsomó adja meg, amelyet az előző kódban vonalként rajzoltunk meg. A `sphereDetail(8)` a gömb felületét alkotó lapok számát csökkenti, ezért egyszerűbb, soklapú alakzatot látunk. A gömbök átmérője a `sin(5t)` miatt változik; a `fill()` összetevői pedig a ciklusváltozóval együtt módosulnak.

:::processing-example title="Gömbök elhelyezése egy térbeli görbe mentén" image="media/10-gombok-terben.webp"
```processing
void setup() {
  size(850, 600, P3D);
  sphereDetail(8);
}

void draw() {
  background(10, 16, 29);
  lights();
  translate(width / 2, height / 2, 0);
  rotateX(-0.5);
  rotateY(frameCount * 0.005);
  noStroke();

  int count = 90;
  for (int i = 0; i < count; i++) {
    float t = TWO_PI * i / count;
    float a = 180 + 68 * cos(3 * t);
    float x = a * cos(2 * t);
    float y = a * sin(2 * t);
    float z = 68 * sin(3 * t);

    pushMatrix();
    translate(x, y, z);
    fill(105 + i, 125 + i / 2, 230);
    sphere(5 + 4 * (1 + sin(5 * t)) / 2);
    popMatrix();
  }
}
```
:::

### Csavarodó keresztmetszetek egy görbe mentén

A görbe mentén elhelyezett alakzatot a helyváltoztatás mellett **folyamatosan forgathatjuk vagy méretezhetjük** is. A pálya itt egy kör: `x(t) = 185 cos(t)`, `y(t) = 185 sin(t)`, `z(t) = 0`, ahol `t ∈ [0, 2π]`. Ennek egyszerű szemléltetése egy körpálya mentén elhelyezett négyzetek sora. A négyzetek síkját először a körpálya érintőjére merőlegesen állítjuk, majd a teljes körbejárás alatt mindegyiket egyre nagyobb szögben elforgatjuk a helyi érintő körül.

:::processing-example title="Kör mentén csavarodó négyzet-keresztmetszetek" image="media/11-csavart-keresztmetszet.webp"
```processing
void setup() {
  size(900, 650, P3D);
  rectMode(CENTER);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.65);
  rotateY(frameCount * 0.004);

  noFill();
  stroke(105, 195, 245, 115);
  strokeWeight(1.4);

  int count = 150;
  for (int i = 0; i < count; i++) {
    float t = TWO_PI * i / count;

    pushMatrix();
    rotateZ(t);
    translate(185, 0, 0);
    rotateY(t);
    rotateX(HALF_PI);
    rect(0, 0, 82, 82);
    popMatrix();
  }
}
```
:::

A `rotateZ(t)` és az eltolás a négyzetet a körpályára viszi. A `rotateX(HALF_PI)` a keresztmetszet síkját a pályára merőlegesen állítja. A közéjük írt `rotateY(t)` a keresztmetszetet a **helyi érintő iránya körül** forgatja. A kétféle forgatás így eltérő feladatot végez: az egyik a pálya menti elhelyezést, a másik a keresztmetszet saját csavarodását hozza létre. A program keresztmetszeteket rajzol, nem hoz létre köztük folytonos felületet.

## Kidolgozott példák {#kidolgozott-peldak}

A fejezet végén két összetettebb alkotást készítünk. Az első síkbeli vonalrendszer, a második térbeli, csavarodó geometrikus kompozíció. Mindkettőt több, önállóan futtatható változatban építjük fel.

### 1. Csillapodó paraméteres görbékből készített kompozíció

A kiindulás egy lassan csillapodó Lissajous-jellegű görbe. A koordinátáit például ezek a függvények adják:

- `x(t) = A e^(−λt) sin(a t + δ)`
- `y(t) = B e^(−λt) sin(b t)`
- `t ∈ [0, 12π]`

A `e^(−λt)` **csillapítási tényező**, amely a paraméter növekedésével egyre kisebb lesz. A Processing `exp(u)` függvénye az `e^u` értéket számítja ki, ahol `e ≈ 2,718`. Ezért a kódban az `exp(-0.045 * t)` a kezdetben 1 körüli szorzót fokozatosan 0 felé csökkenti. A `damping` változó neve angolul csillapítást jelent, és ezt a kiszámított szorzót tárolja; nem a Processing beépített változója. A `0.045` helyére nagyobb értéket írva a görbe gyorsabban húzódik a középpont felé. A további változatokban több, kissé eltérő paraméterű görbét rajzolunk egymásra.

**1. változat – egyetlen csillapodó görbe.**

:::processing-example title="Paraméteres kompozíció – 1. változat" image="media/12-vonalkompozicio-1.webp"
```processing
void setup() {
  size(900, 600);
  background(10, 15, 29);
  translate(width / 2, height / 2);
  noFill();
  stroke(112, 205, 245);
  strokeWeight(1.5);

  beginShape();
  for (int i = 0; i <= 2400; i++) {
    float t = map(i, 0, 2400, 0, 12 * PI);
    float damping = exp(-0.045 * t);
    float x = 245 * damping * sin(3 * t + 0.3);
    float y = 205 * damping * sin(4 * t);
    vertex(x, y);
  }
  endShape();
}
```
:::

Az `exp(-0.045 * t)` mindkét koordinátát ugyanazzal a csillapítási tényezővel szorozza meg, ezért a görbe mindkét irányban fokozatosan kisebb kitéréseket végez. Ha a `0.045` értékét csökkentjük, a görbe lassabban közelít a középponthoz.

**2. változat – több, kissé eltérő görbe.** A külső ciklus többször rajzolja meg a mintát, de a `phase` (fáziseltolás) értéke minden alkalommal más lesz. Ez azt jelenti, hogy a szinuszfüggvényt kissé eltoljuk a paraméter mentén: `sin(3t + phase)`. A különböző fázisok miatt a vonalak nem pontosan ugyanarra a pályára esnek.

:::processing-example title="Paraméteres kompozíció – 2. változat" image="media/13-vonalkompozicio-2.webp"
```processing
void setup() {
  size(900, 600);
  background(10, 15, 29);
  translate(width / 2, height / 2);
  noFill();
  strokeWeight(1.2);

  for (int k = 0; k < 10; k++) {
    float phase = k * 0.055;
    stroke(110, 190, 245, 95);

    beginShape();
    for (int i = 0; i <= 1800; i++) {
      float t = map(i, 0, 1800, 0, 12 * PI);
      float damping = exp(-0.045 * t);
      float x = 245 * damping * sin(3 * t + phase);
      float y = 205 * damping * sin(4 * t + 0.3);
      vertex(x, y);
    }
    endShape();
  }
}
```
:::

**3. változat – színváltoztatás.** A színkomponensek a `k` ciklusváltozó szerint módosulnak. A `stroke(vörös, zöld, kék, alfa)` negyedik paramétere az áttetszőséget adja meg: kisebb értéknél a vonal halványabb, így az egymásra kerülő szakaszok különböző tónusokat hozhatnak létre. A példában nem változik a görbék csillapítása; csak a fázisuk és a színük tér el.

:::processing-example title="Paraméteres kompozíció – 3. változat" image="media/14-vonalkompozicio-3.webp"
```processing
void setup() {
  size(900, 600);
  background(10, 15, 29);
  translate(width / 2, height / 2);
  noFill();
  strokeWeight(1.2);

  for (int k = 0; k < 13; k++) {
    float phase = k * 0.06;
    stroke(80 + k * 12, 200 - k * 6, 245, 88);

    beginShape();
    for (int i = 0; i <= 1800; i++) {
      float t = map(i, 0, 1800, 0, 12 * PI);
      float damping = exp(-0.045 * t);
      float x = 245 * damping * sin(3 * t + phase);
      float y = 205 * damping * sin(4 * t + 0.3);
      vertex(x, y);
    }
    endShape();
  }
}
```
:::

**4. változat – több motívumból álló kompozíció.** A rajzolást saját metódusba szervezzük. A `drawMotif()` megkapja a középpont (`cx`, `cy`) koordinátáit, a két irány kiterjedését (`ax`, `ay`), a frekvenciákat (`fx`, `fy`) és az alapszínt (`c`). Ugyanaz a megoldás három eltérő helyen készít mintázatot. A `pushMatrix()` és `popMatrix()` gondoskodik arról, hogy az egyik motívumhoz végzett eltolás ne módosítsa a következő helyét.

:::processing-example title="Paraméteres kompozíció – 4. változat" image="media/15-vonalkompozicio-4.webp"
```processing
void setup() {
  size(950, 620);
  background(10, 15, 29);
  noFill();

  drawMotif(245, 285, 185, 155, 3, 4,
            color(125, 205, 245));
  drawMotif(690, 260, 175, 170, 4, 5,
            color(245, 150, 185));
  drawMotif(475, 425, 165, 115, 5, 6,
            color(240, 205, 105));
}

void drawMotif(float cx, float cy,
               float ax, float ay,
               float fx, float fy, color c) {
  pushMatrix();
  translate(cx, cy);
  strokeWeight(1.15);

  for (int k = 0; k < 10; k++) {
    float phase = k * 0.06;
    stroke(c, 85);

    beginShape();
    for (int i = 0; i <= 1600; i++) {
      float t = map(i, 0, 1600, 0, 12 * PI);
      float damping = exp(-0.045 * t);
      float x = ax * damping * sin(fx * t + phase);
      float y = ay * damping * sin(fy * t + 0.3);
      vertex(x, y);
    }
    endShape();
  }
  popMatrix();
}
```
:::

### 2. Térbeli kompozíció csavarodó keresztmetszetekből

A második kompozíciót egy térbeli körpályából építjük fel. A pálya képletei `x(t) = 185 cos(t)`, `y(t) = 185 sin(t)`, `z(t) = 0`, ahol `t ∈ [0, 2π]`. Először csak a pályát rajzoljuk meg, majd négyzetes keresztmetszeteket helyezünk el rajta. Ezután a keresztmetszeteket a pálya érintőjének irányában elforgatjuk, végül több, eltérő paraméterű rendszert helyezünk el ugyanabban a jelenetben.

**1. változat – a körpálya megjelenítése.** A pálya vonalát a `vertex(x, y, z)` segítségével állítjuk elő.

:::processing-example title="Térbeli kompozíció – 1. változat" image="media/16-terbeli-kompozicio-1.webp"
```processing
void setup() {
  size(900, 650, P3D);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.65);
  rotateY(frameCount * 0.004);
  noFill();
  stroke(110, 205, 245);
  strokeWeight(3);

  beginShape();
  for (int i = 0; i <= 300; i++) {
    float t = TWO_PI * i / 300;
    vertex(185 * cos(t), 185 * sin(t), 0);
  }
  endShape();
}
```
:::

**2. változat – négyzetes keresztmetszetek.** Most a görbe kiválasztott pontjain a négyzetet a pályára merőleges síkban rajzoljuk ki. Még nincs saját csavarodás.

:::processing-example title="Térbeli kompozíció – 2. változat" image="media/17-terbeli-kompozicio-2.webp"
```processing
void setup() {
  size(900, 650, P3D);
  rectMode(CENTER);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.65);
  rotateY(frameCount * 0.004);
  noFill();
  stroke(105, 195, 245, 115);
  strokeWeight(1.4);

  for (int i = 0; i < 120; i++) {
    float t = TWO_PI * i / 120;
    pushMatrix();
    rotateZ(t);
    translate(185, 0, 0);
    rotateX(HALF_PI);
    rect(0, 0, 82, 82);
    popMatrix();
  }
}
```
:::

**3. változat – csavarodó keresztmetszetek.** A helyi elforgatás szögét a `t` paraméterből számítjuk: `szög(t) = t`. A `rotateY(t)` a négyzetet az aktuális helyi tengely körül forgatja. Így egy teljes körbejárás alatt a négyzet egyszer körbefordul a keresztmetszeti síkjában.

:::processing-example title="Térbeli kompozíció – 3. változat" image="media/18-terbeli-kompozicio-3.webp"
```processing
void setup() {
  size(900, 650, P3D);
  rectMode(CENTER);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.65);
  rotateY(frameCount * 0.004);
  noFill();
  stroke(105, 195, 245, 115);
  strokeWeight(1.4);

  for (int i = 0; i < 150; i++) {
    float t = TWO_PI * i / 150;
    pushMatrix();
    rotateZ(t);
    translate(185, 0, 0);
    rotateY(t);
    rotateX(HALF_PI);
    rect(0, 0, 82, 82);
    popMatrix();
  }
}
```
:::

**4. változat – több egymásba helyezett szerkezet.** Az ismétlődő rajzolást `drawTwistedRing()` metódusba helyezzük. A `radius` a kör sugara, a `sectionSize` a négyzet alapmérete, a `twistCount` a körbejárás alatti teljes csavarodások száma, a `c` pedig a szín. A méretet a `size(t) = sectionSize · (0.85 + 0.15 sin(4t))` összefüggés szerint is változtatjuk. Három eltérő rendszer együtteséből állítjuk elő a végső kompozíciót.

:::processing-example title="Térbeli kompozíció – 4. változat" image="media/19-terbeli-kompozicio-4.webp"
```processing
void setup() {
  size(900, 650, P3D);
  rectMode(CENTER);
}

void draw() {
  background(10, 16, 29);
  translate(width / 2, height / 2, 0);
  rotateX(-0.65);
  rotateY(frameCount * 0.004);
  noFill();
  strokeWeight(1.25);

  drawTwistedRing(185, 80, 1,
                  color(95, 200, 250));

  pushMatrix();
  rotateX(0.75);
  drawTwistedRing(137, 57, 2,
                  color(240, 125, 190));
  popMatrix();

  pushMatrix();
  rotateY(0.85);
  drawTwistedRing(92, 39, 3,
                  color(240, 205, 105));
  popMatrix();
}

void drawTwistedRing(float radius,
                     float sectionSize,
                     float twistCount, color c) {
  stroke(c, 110);
  int count = 160;

  for (int i = 0; i < count; i++) {
    float t = TWO_PI * i / count;
    float size = sectionSize *
                 (0.85 + 0.15 * sin(4 * t));

    pushMatrix();
    rotateZ(t);
    translate(radius, 0, 0);
    rotateY(twistCount * t);
    rotateX(HALF_PI);
    rect(0, 0, size, size);
    popMatrix();
  }
}
```
:::

Az alakzatok középpontjai különböző sugarú körökön haladnak, miközben a keresztmetszetek elfordulnak és kissé méretet is változtatnak. A jelenet lassú forgatása segít felismerni a térbeli szerkezetet. A program nem számít felületet a keresztmetszetek közé; a kép egymás mellé rajzolt vonalalakzatokból jön létre.

A fejezet példái ugyanazt a gondolatot használják eltérő módon: a paraméterből meghatározzuk a helyet, majd szükség esetén ugyanebből a paraméterből számítjuk a méretet, az irányt vagy a színt. Így egyetlen változó több tulajdonságot is egységesen szabályozhat.
