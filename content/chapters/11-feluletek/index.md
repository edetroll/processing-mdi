# Felületek

A görbéket egyetlen paraméterrel írtuk le, és a kiszámított pontokat egymás után összekötöttük. A felületek esetében két irányban mintavételezünk: a pontokból **rácsot** készítünk, a szomszédos pontokból pedig kisebb felületelemeket állítunk elő. A fejezetben először magasságfüggvényekkel, majd kétparaméteres felületekkel dolgozunk. Végül megvizsgáljuk, hogyan alakítanak egy felületet a kontrollpontjai.

A példák Processing **Java-módban** futnak, a térbeli megjelenítéshez `P3D` szükséges. A képletekben használt betűk és a Processing-változók közötti megfelelést minden új felülettípusnál megadjuk.

## Felületek előállítása pontrácsból {#pontracs}

A felületet a számítógép nem végtelen sok pontból rajzolja meg: az értelmezési tartományt kis részekre osztjuk, és a kapott mintapontokból állítjuk össze a hálót. Ha a felületet csak az élekkel jelenítjük meg, **drótvázat** látunk; ha az elemeket kitöltjük és megvilágítjuk, a felület folytonosnak látszik.

A `beginShape(QUAD_STRIP)` egy négyszögsávot kezd. A program felváltva adja meg két szomszédos rácssor megfelelő pontjait, így egymáshoz illeszkedő négyszögek keletkeznek. A sávot minden sorpár után `endShape()` zárja. Nagyobb lépésköznél durvább, kisebb lépésköznél részletesebb hálót kapunk.

:::processing-example title="Pontrácsból felület – vonalháló" image="media/01-drotvaz.webp"
```processing
void setup() {
  size(900, 620, P3D);
  noLoop();
}

void draw() {
  background(13, 21, 35);
  translate(width/2, height/2, 0);
  rotateX(PI/3);
  rotateZ(-PI/5);
  noFill();
  stroke(100, 200, 225);
  strokeWeight(1.4);

  int n = 22;
  float step = 460.0 / n;
  for (int row = 0; row < n; row++) {
    float y0 = -230 + row * step;
    float y1 = y0 + step;
    beginShape(QUAD_STRIP);
    for (int col = 0; col <= n; col++) {
      float x = -230 + col * step;
      vertex(x, y0, heightAt(x, y0));
      vertex(x, y1, heightAt(x, y1));
    }
    endShape();
  }
}

float heightAt(float x, float y) {
  return 62 * sin(x * 0.023) * cos(y * 0.023);
}
```
:::

A második program **nem új pontokat számít**, hanem ugyanazt a rácsot felületelemekkel tölti ki. A `noFill()` helyét kitöltés, a vonalháló önálló megjelenítését pedig a `lights()` által megvilágított felület veszi át. A következő lépésben az egyes csúcsok színét is a magasságukhoz fogjuk kötni.

:::processing-example title="Ugyanaz a felület kitöltve és megvilágítva" image="media/02-kitoltott.webp"
```processing
void setup() {
  size(900, 620, P3D);
  noLoop();
}

void draw() {
  background(13, 21, 35);
  translate(width/2, height/2, 0);
  rotateX(PI/3);
  rotateZ(-PI/5);
  lights();
  stroke(19, 69, 95);
  strokeWeight(0.8);

  int n = 22;
  float step = 460.0 / n;
  for (int row = 0; row < n; row++) {
    float y0 = -230 + row * step;
    float y1 = y0 + step;
    beginShape(QUAD_STRIP);
    for (int col = 0; col <= n; col++) {
      float x = -230 + col * step;
      float z0 = heightAt(x, y0);
      float z1 = heightAt(x, y1);
      fill(surfaceColor(z0)); vertex(x, y0, z0);
      fill(surfaceColor(z1)); vertex(x, y1, z1);
    }
    endShape();
  }
}

float heightAt(float x, float y) {
  return 62 * sin(x * 0.023) * cos(y * 0.023);
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

A két programban **ugyanazok a pontok** keletkeznek. A különbség a rajzolási beállításokban van. A `lights()` a felület részeinek eltérő világosságát eredményezi, a `surfaceColor()` pedig a magasságot kékeszöld és meleg színekkel jelzi. A `lerpColor()` két szín között képez átmenetet, a `constrain()` pedig a kiválasztott színtartományban tartja az értéket. A `noLoop()` azért használható, mert a felület nem változik.

## Explicit felületek {#explicit}

Ha az első két koordináta szabadon megválasztható, a harmadikat pedig egy függvény számítja ki, **explicit** magasságfüggvényt kapunk:

\[
z=f(x,y),\qquad x\in[a,b],\quad y\in[c,d].
\]

A geometriai forma a `heightAt(x, y)` függvény cseréjével változtatható. A csúcspontok színét ettől függetlenül a `surfaceColor()` számítja ki a magasság alapján. A `heightAt` neve itt a magasságra utal, de a Processingben a függvény eredményét a harmadik, **z koordinátaként** adjuk át a `vertex()` hívásnak. A megvilágítást és a nézetet a `translate()` és `rotateX()/rotateZ()` beállításai határozzák meg.

**Hullámfelület.** Két egymásra merőleges irányú hullám szorzata:

\[
z(x,y)=A\sin(kx)\cos(ky),\qquad x,y\in[-230,230].
\]

Az \(A\) az amplitúdó, a \(k\) a térbeli frekvencia: nagyobb \(k\) esetén ugyanakkora tartományban több hullám fér el.

:::processing-example title="Hullámfelület – a heightAt() függvény módosítása" image="media/03-hullam.webp"
```processing
void setup() {
  size(900, 620, P3D);
  noLoop();
}

void draw() {
  background(13, 21, 35);
  translate(width/2, height/2, 0);
  rotateX(PI/3);
  rotateZ(-PI/5);
  lights();
  stroke(19, 69, 95);
  strokeWeight(0.8);

  int n = 22;
  float step = 460.0 / n;
  for (int row = 0; row < n; row++) {
    float y0 = -230 + row * step;
    float y1 = y0 + step;
    beginShape(QUAD_STRIP);
    for (int col = 0; col <= n; col++) {
      float x = -230 + col * step;
      float z0 = heightAt(x, y0);
      float z1 = heightAt(x, y1);
      fill(surfaceColor(z0)); vertex(x, y0, z0);
      fill(surfaceColor(z1)); vertex(x, y1, z1);
    }
    endShape();
  }
}

float heightAt(float x, float y) {
  return 62 * sin(x * 0.023) * cos(y * 0.023);
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

**Gauss-domb.** Az origótól távolodva a felület magassága fokozatosan csökken:

\[
z(x,y)=A\exp\!\left(-\frac{x^2+y^2}{s^2}\right).
\]

Az `exp(q)` az \(e^q\) exponenciális függvényt számítja ki, ahol \(e\approx2{,}718\). A negatív kitevő miatt a domb távolabb egyre alacsonyabb. Az \(s\) a domb kiterjedését, az \(A\) a magasságát szabályozza.

:::processing-example title="Gauss-domb" image="media/04-gauss.webp"
```processing
void setup() {
  size(900, 620, P3D);
  noLoop();
}

void draw() {
  background(13, 21, 35);
  translate(width/2, height/2, 0);
  rotateX(PI/3);
  rotateZ(-PI/5);
  lights();
  stroke(19, 69, 95);
  strokeWeight(0.8);

  int n = 22;
  float step = 460.0 / n;
  for (int row = 0; row < n; row++) {
    float y0 = -230 + row * step;
    float y1 = y0 + step;
    beginShape(QUAD_STRIP);
    for (int col = 0; col <= n; col++) {
      float x = -230 + col * step;
      float z0 = heightAt(x, y0);
      float z1 = heightAt(x, y1);
      fill(surfaceColor(z0)); vertex(x, y0, z0);
      fill(surfaceColor(z1)); vertex(x, y1, z1);
    }
    endShape();
  }
}

float heightAt(float x, float y) {
  float A = 155;
  float s = 145;
  return A * exp(-(x*x + y*y) / (s*s));
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

**Nyeregfelület.** A következő függvény egyik irányban felfelé, a másik irányban lefelé görbül:

\[
z(x,y)=c(x^2-y^2),\qquad c=0{,}0015.
\]

A szorzót azért választjuk ilyen kicsinek, mert az \(x^2\) és az \(y^2\) értékek a megadott rajzfelületen nagyok lehetnek.

:::processing-example title="Nyeregfelület" image="media/05-nyereg.webp"
```processing
void setup() {
  size(900, 620, P3D);
  noLoop();
}

void draw() {
  background(13, 21, 35);
  translate(width/2, height/2, 0);
  rotateX(PI/3);
  rotateZ(-PI/5);
  lights();
  stroke(19, 69, 95);
  strokeWeight(0.8);

  int n = 22;
  float step = 460.0 / n;
  for (int row = 0; row < n; row++) {
    float y0 = -230 + row * step;
    float y1 = y0 + step;
    beginShape(QUAD_STRIP);
    for (int col = 0; col <= n; col++) {
      float x = -230 + col * step;
      float z0 = heightAt(x, y0);
      float z1 = heightAt(x, y1);
      fill(surfaceColor(z0)); vertex(x, y0, z0);
      fill(surfaceColor(z1)); vertex(x, y1, z1);
    }
    endShape();
  }
}

float heightAt(float x, float y) {
  return 0.0015 * (x*x - y*y);
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

## Paraméteres felületek {#parameteres}

Bizonyos felületeket nem lehet egyetlen \(z=f(x,y)\) magasságfüggvénnyel leírni. A gömb és a tórusz esetében például ugyanahhoz az \((x,y)\) párhoz több magasság is tartozhat. Ilyenkor két paraméterből számítjuk **mindhárom koordinátát**:

\[
\begin{aligned}
x&=x(u,v),\\
y&=y(u,v),\\
z&=z(u,v),\\
u&\in[u_{\min},u_{\max}],\quad
v\in[v_{\min},v_{\max}].
\end{aligned}
\]

A két egymásba ágyazott ciklus az \(u\) és \(v\) paraméterek értékeit változtatja. A felület megrajzolásának menete változatlan: a szomszédos mintákból négyszögsávokat készítünk. Az explicit felületekhez képest most nem csak a magasságot számítjuk, hanem minden mintapont teljes \((x,y,z)\) koordinátáját. A következő program általános vázként is használható: a `surfaceX`, `surfaceY`, `surfaceZ` függvények, a paramétertartományok és a mintavételi felbontás cserélhető.

**Tórusz.** A \(R\) a tórusz középvonali sugara, az \(r\) a cső sugara:

\[
\begin{aligned}
x(u,v)&=(R+r\cos v)\cos u,\\
y(u,v)&=(R+r\cos v)\sin u,\\
z(u,v)&=r\sin v,\\
u,v&\in[0,2\pi].
\end{aligned}
\]

Ha \(R>r>0\), a felületnek belső nyílása van. A kód az összes mintapontot egyetlen, kiszámítható hálózati szerkezetben rajzolja meg.

:::processing-example title="Tórusz – általános paraméteres felületváz" image="media/06-torusz.webp"
```processing
float uMin = 0, uMax = TWO_PI;
float vMin = 0, vMax = TWO_PI;
int uSteps = 80, vSteps = 24;

void setup() {
  size(900, 620, P3D);
}

void draw() {
  background(13, 21, 35);
  lights();
  translate(width/2, height/2, 0);
  rotateX(-0.52);
  rotateY(frameCount * 0.004);
  stroke(25, 89, 110, 85);
  strokeWeight(0.6);

  for (int i = 0; i < uSteps; i++) {
    float u0 = map(i,   0, uSteps, uMin, uMax);
    float u1 = map(i+1, 0, uSteps, uMin, uMax);
    beginShape(QUAD_STRIP);
    for (int j = 0; j <= vSteps; j++) {
      float v = map(j, 0, vSteps, vMin, vMax);
      float z0 = surfaceZ(u0, v), z1 = surfaceZ(u1, v);
      fill(surfaceColor(z0));
      vertex(surfaceX(u0, v), surfaceY(u0, v), z0);
      fill(surfaceColor(z1));
      vertex(surfaceX(u1, v), surfaceY(u1, v), z1);
    }
    endShape();
  }
}

float surfaceX(float u, float v) {
  float R = 155, r = 64;
  return (R + r*cos(v))*cos(u);
}
float surfaceY(float u, float v) {
  float R = 155, r = 64;
  return (R + r*cos(v))*sin(u);
}
float surfaceZ(float u, float v) {
  float r = 64;
  return r*sin(v);
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

**Gömb.** A tóruszhoz hasonlóan most is kétparaméteres felületet használunk, de megváltoztatjuk a `v` tartományát és a három `surface` metódus képletét. A \(r\) sugarú gömb felületének egyik paraméterezése:

\[
\begin{aligned}
x(u,v)&=r\sin v\cos u,\\
y(u,v)&=r\sin v\sin u,\\
z(u,v)&=r\cos v,\\
u&\in[0,2\pi],\quad v\in[0,\pi].
\end{aligned}
\]

A \(v\) a két pólus között halad, az \(u\) a tengely körül fordul körbe. A pólusokban több rácspont ugyanarra a helyre kerül; ez a paraméterezés sajátossága.

:::processing-example title="Gömb paraméteres egyenletekből" image="media/07-gomb.webp"
```processing
float uMin = 0, uMax = TWO_PI;
float vMin = 0, vMax = PI;
int uSteps = 80, vSteps = 24;

void setup() {
  size(900, 620, P3D);
}

void draw() {
  background(13, 21, 35);
  lights();
  translate(width/2, height/2, 0);
  rotateX(-0.52);
  rotateY(frameCount * 0.004);
  stroke(25, 89, 110, 85);
  strokeWeight(0.6);

  for (int i = 0; i < uSteps; i++) {
    float u0 = map(i,   0, uSteps, uMin, uMax);
    float u1 = map(i+1, 0, uSteps, uMin, uMax);
    beginShape(QUAD_STRIP);
    for (int j = 0; j <= vSteps; j++) {
      float v = map(j, 0, vSteps, vMin, vMax);
      float z0 = surfaceZ(u0, v), z1 = surfaceZ(u1, v);
      fill(surfaceColor(z0));
      vertex(surfaceX(u0, v), surfaceY(u0, v), z0);
      fill(surfaceColor(z1));
      vertex(surfaceX(u1, v), surfaceY(u1, v), z1);
    }
    endShape();
  }
}

float surfaceX(float u, float v) {
  return 200 * sin(v) * cos(u);
}
float surfaceY(float u, float v) {
  return 200 * sin(v) * sin(u);
}
float surfaceZ(float u, float v) {
  return 200 * cos(v);
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

**Möbius-szalag.** Az előző két felület zárt és forgásszimmetrikus volt. A Möbius-szalagnál a második paraméter egy keskeny szalag szélességén halad végig; a középvonal egy kör, miközben a körülötte elhelyezett szakasz a teljes körbejárás alatt fél fordulatot tesz:

\[
\begin{aligned}
x(u,v)&=(R+v\cos(u/2))\cos u,\\
y(u,v)&=(R+v\cos(u/2))\sin u,\\
z(u,v)&=v\sin(u/2),\\
u&\in[0,2\pi],\quad v\in[-w,w].
\end{aligned}
\]

A \(w\) a szalag fél szélessége. A képletben az \(u/2\) okozza a félcsavarást. A Möbius-szalagnak egyetlen oldala és egyetlen peremvonala van. A következő program a `vertex()`-ek sorrendjét és a két paramétertartományt is helyesen kezeli.

:::processing-example title="Möbius-szalag" image="media/08-mobius.webp"
```processing
float uMin = 0, uMax = TWO_PI;
float vMin = -55, vMax = 55;
int uSteps = 130, vSteps = 18;

void setup() {
  size(900, 620, P3D);
}

void draw() {
  background(13, 21, 35);
  lights();
  translate(width/2, height/2, 0);
  rotateX(-0.52);
  rotateY(frameCount * 0.004);
  stroke(25, 89, 110, 85);
  strokeWeight(0.6);

  for (int i = 0; i < uSteps; i++) {
    float u0 = map(i,   0, uSteps, uMin, uMax);
    float u1 = map(i+1, 0, uSteps, uMin, uMax);
    beginShape(QUAD_STRIP);
    for (int j = 0; j <= vSteps; j++) {
      float v = map(j, 0, vSteps, vMin, vMax);
      float z0 = surfaceZ(u0, v), z1 = surfaceZ(u1, v);
      fill(surfaceColor(z0));
      vertex(surfaceX(u0, v), surfaceY(u0, v), z0);
      fill(surfaceColor(z1));
      vertex(surfaceX(u1, v), surfaceY(u1, v), z1);
    }
    endShape();
  }
}

float surfaceX(float u, float v) {
  return (165 + v*cos(u/2)) * cos(u);
}
float surfaceY(float u, float v) {
  return (165 + v*cos(u/2)) * sin(u);
}
float surfaceZ(float u, float v) {
  return v*sin(u/2);
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

**Csavarfelület (helikoid).** A Möbius-szalaggal szemben itt nincs visszazáródó körpálya: a harmadik koordináta a szöggel együtt növekszik. Egy egyenes szakasz az origó körül forog, miközben a forgás szögével arányosan emelkedik:

\[
\begin{aligned}
x(u,v)&=v\cos u,\\
y(u,v)&=v\sin u,\\
z(u,v)&=cu,\\
u&\in[-2\pi,2\pi],\quad v\in[-150,150].
\end{aligned}
\]

A \(c\) szabályozza, hogy egy teljes fordulat alatt mennyit emelkedjen a felület. Érdemes összehasonlítani a Möbius-szalaggal: itt nem záródik össze a felület.

:::processing-example title="Csavarfelület" image="media/09-csavarfelulet.webp"
```processing
float uMin = -TWO_PI, uMax = TWO_PI;
float vMin = -150, vMax = 150;
int uSteps = 120, vSteps = 20;

void setup() {
  size(900, 620, P3D);
}

void draw() {
  background(13, 21, 35);
  lights();
  translate(width/2, height/2, 0);
  rotateX(-0.52);
  rotateY(frameCount * 0.004);
  stroke(25, 89, 110, 85);
  strokeWeight(0.6);

  for (int i = 0; i < uSteps; i++) {
    float u0 = map(i,   0, uSteps, uMin, uMax);
    float u1 = map(i+1, 0, uSteps, uMin, uMax);
    beginShape(QUAD_STRIP);
    for (int j = 0; j <= vSteps; j++) {
      float v = map(j, 0, vSteps, vMin, vMax);
      float z0 = surfaceZ(u0, v), z1 = surfaceZ(u1, v);
      fill(surfaceColor(z0));
      vertex(surfaceX(u0, v), surfaceY(u0, v), z0);
      fill(surfaceColor(z1));
      vertex(surfaceX(u1, v), surfaceY(u1, v), z1);
    }
    endShape();
  }
}

float surfaceX(float u, float v) {
  return v*cos(u);
}
float surfaceY(float u, float v) {
  return v*sin(u);
}
float surfaceZ(float u, float v) {
  return 22*u;
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

A Klein-kancsó további érdekes példa egy olyan felületre, amely önmetszés nélkül **nem ágyazható be a szokásos háromdimenziós térbe**. Vannak térbeli, önmetsző paraméterezései, de ezek megértéséhez további geometriai fogalmakra lenne szükség; ezért itt nem készítünk belőle külön programot.

## Kontrollpontokkal meghatározott felületek {#bezier}

A Bézier-görbe alakját kontrollpontok befolyásolják. A kétparaméteres Bézier-felületet hasonlóan határozzuk meg: a pontok most egy **4×4-es kontrollhálót** alkotnak. A háló két irányban összekötött, összesen 16 pontból áll; ez a felületet vezérlő geometria, **nem maga a felület**.

\[
S(u,v)=\sum_{i=0}^{3}\sum_{j=0}^{3}B_i^3(u)B_j^3(v)P_{ij},
\qquad u,v\in[0,1].
\]

A \(P_{ij}\) kontrollpontok térbeli koordináták, a \(B_i^3\) pedig a harmadfokú Bernstein-polinomok. A felület egy pontját a program a kontrollpontok súlyozott összegeként számítja ki. A négy sarokpont a felület sarokpontja is; a többi kontrollpont általában nem helyezkedik el a felületen.

**A kontrollháló.** Először csak a 16 pontot és az őket mindkét rácsirányban összekötő szakaszokat rajzoljuk meg. A `PVector` három koordinátát tárol. A következő két program ugyanazt a `control` tömböt fogja használni, ezért a felület és a kontrollháló viszonya közvetlenül összehasonlítható.

:::processing-example title="A Bézier-felület kontrollhálója" image="media/10-bezier-halo.webp"
```processing
PVector[][] control = new PVector[4][4];

void setup() {
  size(900, 620, P3D);
  ortho();
  for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 4; j++) {
      float x = (i - 1.5) * 135;
      float y = (j - 1.5) * 135;
      float z = 65 * sin(i * 1.1) * cos(j * 1.15);
      control[i][j] = new PVector(x, y, z);
    }
  }
}

void draw() {
  background(13, 21, 35);
  translate(width/2, height/2, 0);
  rotateX(0.78);
  rotateZ(-PI/5);
  stroke(246, 172, 100);
  strokeWeight(2);
  for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 3; j++) {
      PVector a = control[i][j], b = control[i][j+1];
      line(a.x, a.y, a.z, b.x, b.y, b.z);
      a = control[j][i]; b = control[j+1][i];
      line(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  strokeWeight(10);
  for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 4; j++) {
      PVector p = control[i][j];
      point(p.x, p.y, p.z);
    }
  }
}
```
:::

**A kiszámított felület.** A második program a kontrollhálón kívül a belőle számított felületet is megjeleníti. Az új `bernstein()` metódus a súlyokat adja meg, a `surface(u,v)` pedig ezeket összegzi az összes kontrollpont koordinátájával. A `QUAD_STRIP` ciklus már ennek a metódusnak az eredményéből építi fel a felületet, nem közvetlenül a kontrollpontokból. A szín az így kapott pontok magasságától függ.

:::processing-example title="A kontrollháló és a számított Bézier-felület" image="media/11-bezier-felulet.webp"
```processing
PVector[][] control = new PVector[4][4];

void setup() {
  size(900, 620, P3D);
  ortho();
  for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 4; j++) {
      control[i][j] = new PVector(
        (i - 1.5) * 135, (j - 1.5) * 135,
        65 * sin(i * 1.1) * cos(j * 1.15));
    }
  }
}

void draw() {
  background(13, 21, 35);
  ambientLight(110, 110, 110);
  directionalLight(220, 220, 220, -0.4, -0.7, -1);
  translate(width/2, height/2, 0);
  rotateX(0.78);
  rotateZ(-PI/5);

  noStroke();
  for (int i = 0; i < 40; i++) {
    float u0 = i/40.0, u1 = (i+1)/40.0;
    beginShape(QUAD_STRIP);
    for (int j = 0; j <= 40; j++) {
      float v = j/40.0;
      PVector a = surface(u0, v), b = surface(u1, v);
      fill(surfaceColor(a.z)); vertex(a.x, a.y, a.z);
      fill(surfaceColor(b.z)); vertex(b.x, b.y, b.z);
    }
    endShape();
  }

  hint(DISABLE_DEPTH_TEST); // A kontrollhalo a felulet elott is lathato.
  stroke(246, 172, 100);
  strokeWeight(2);
  for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 3; j++) {
      PVector a = control[i][j], b = control[i][j+1];
      line(a.x,a.y,a.z,b.x,b.y,b.z);
      a = control[j][i]; b = control[j+1][i];
      line(a.x,a.y,a.z,b.x,b.y,b.z);
    }
  }
  strokeWeight(9);
  for (int i = 0; i < 4; i++)
    for (int j = 0; j < 4; j++) {
      PVector p = control[i][j];
      point(p.x,p.y,p.z);
    }
  hint(ENABLE_DEPTH_TEST);
}

float bernstein(int i, float t) {
  if (i == 0) return pow(1-t, 3);
  if (i == 1) return 3*t*pow(1-t, 2);
  if (i == 2) return 3*t*t*(1-t);
  return t*t*t;
}

PVector surface(float u, float v) {
  PVector p = new PVector();
  for (int i = 0; i < 4; i++)
    for (int j = 0; j < 4; j++) {
      float w = bernstein(i,u) * bernstein(j,v);
      p.add(PVector.mult(control[i][j], w));
    }
  return p;
}

color surfaceColor(float z) {
  return lerpColor(color(45, 151, 197), color(247, 178, 110),
    constrain(map(z, -130, 160, 0, 1), 0, 1));
}
```
:::

**A kontrollpontok módosítása egérrel.** Most a kontrollháló egy pontjára kattinthatunk, majd **az egér függőleges mozgatásával a kijelölt pont magasságát** változtathatjuk. A `screenX()` és `screenY()` a térbeli pont vetített képernyő-koordinátáját adja meg; ebből tudjuk kiválasztani a kattintáshoz legközelebbi pontot. A `mouseDragged()` csak a kiválasztott pont `z` értékét módosítja. A `draw()` ezután ugyanabból a `control` tömbből **újraszámítja a felület minden csúcspontját**, tehát a felület ténylegesen követi a kontrollháló változását.

:::processing-example title="A kontrollpontok módosítása egérrel" image="media/12-bezier-interaktiv.webp"
```processing
PVector[][] control = new PVector[4][4];
int selectedI = -1, selectedJ = -1;
int startMouseY;
float startHeight;

void setup() {
  size(900, 620, P3D);
  ortho();
  for (int i = 0; i < 4; i++)
    for (int j = 0; j < 4; j++)
      control[i][j] = new PVector(
        (i-1.5)*135, (j-1.5)*135,
        65*sin(i*1.1)*cos(j*1.15));
}

void setView() {
  translate(width/2, height/2, 0);
  rotateX(0.78);
  rotateZ(-PI/5);
}

void draw() {
  background(13, 21, 35);
  ambientLight(110, 110, 110);
  directionalLight(220, 220, 220, -0.4, -0.7, -1);
  pushMatrix();
  setView();

  noStroke();
  for (int i = 0; i < 40; i++) {
    float u0 = i/40.0, u1 = (i+1)/40.0;
    beginShape(QUAD_STRIP);
    for (int j = 0; j <= 40; j++) {
      float v = j/40.0;
      PVector a = surface(u0,v), b = surface(u1,v);
      fill(surfaceColor(a.z)); vertex(a.x,a.y,a.z);
      fill(surfaceColor(b.z)); vertex(b.x,b.y,b.z);
    }
    endShape();
  }

  // Kijelolt pontot is lathatoan kiemeljuk.
  hint(DISABLE_DEPTH_TEST);
  stroke(247, 177, 108);
  strokeWeight(2);
  for (int i = 0; i < 4; i++)
    for (int j = 0; j < 3; j++) {
      PVector a = control[i][j], b = control[i][j+1];
      line(a.x,a.y,a.z,b.x,b.y,b.z);
      a = control[j][i]; b = control[j+1][i];
      line(a.x,a.y,a.z,b.x,b.y,b.z);
    }
  for (int i = 0; i < 4; i++)
    for (int j = 0; j < 4; j++) {
      PVector p = control[i][j];
      stroke(i == selectedI && j == selectedJ
        ? color(255, 230, 125) : color(248, 183, 115));
      strokeWeight(i == selectedI && j == selectedJ ? 18 : 11);
      point(p.x,p.y,p.z);
    }
  hint(ENABLE_DEPTH_TEST);
  popMatrix();
}

void mousePressed() {
  selectedI = selectedJ = -1;
  float best = 19;
  pushMatrix();
  setView();
  for (int i = 0; i < 4; i++)
    for (int j = 0; j < 4; j++) {
      PVector p = control[i][j];
      float d = dist(mouseX, mouseY,
        screenX(p.x,p.y,p.z), screenY(p.x,p.y,p.z));
      if (d < best) { best = d; selectedI = i; selectedJ = j; }
    }
  popMatrix();
  if (selectedI >= 0) {
    startMouseY = mouseY;
    startHeight = control[selectedI][selectedJ].z;
  }
}

void mouseDragged() {
  if (selectedI < 0) return;
  PVector p = control[selectedI][selectedJ];
  pushMatrix();
  setView();
  float pixelsPerUnit = screenY(p.x,p.y,1)-screenY(p.x,p.y,0);
  popMatrix();
  p.z = constrain(startHeight +
    (mouseY-startMouseY)/pixelsPerUnit, -190, 190);
}

void mouseReleased() { selectedI = selectedJ = -1; }

float bernstein(int i, float t) {
  if (i == 0) return pow(1-t, 3);
  if (i == 1) return 3*t*pow(1-t, 2);
  if (i == 2) return 3*t*t*(1-t);
  return t*t*t;
}

PVector surface(float u, float v) {
  PVector p = new PVector();
  for (int i = 0; i < 4; i++)
    for (int j = 0; j < 4; j++) {
      float w = bernstein(i,u)*bernstein(j,v);
      p.add(PVector.mult(control[i][j], w));
    }
  return p;
}

color surfaceColor(float z) {
  return lerpColor(color(45,151,197), color(247,178,110),
    constrain(map(z,-130,160,0,1),0,1));
}
```
:::

A kijelölt pont a húzás közben világosabb jelölést kap. A működés ellenőrizhető azzal is, hogy a kontrollháló egy belső pontját felemeljük: a felület közelében létrejövő domborulat a mozgatott pont felé változik, de a négy sarokpont a helyén marad. A **kontrollpont helye és a felület megfelelő mintapontja nem azonos**, ezért nem kell a felületnek a teljes hálóra ráfeküdnie.

## Kidolgozott példa – hullámzó felület {#kidolgozott}

Az utolsó példában egy egyszerű rácsból fokozatosan mozgó felület készül. A szokásos \(x,y\) helyett itt is a harmadik koordináta változik: \(z=f(x,y,t)\). A \(t\) ezúttal **idő**, amelyet a `frameCount` alapján adunk meg. A képkockák között a felület ugyanazon pontjainak magassága változik.

A középpontból terjedő hullám egyik lehetséges képlete:

\[
\begin{aligned}
r&=\sqrt{(x-x_0)^2+(y-y_0)^2},\\
z(x,y,t)&=A\sin(kr-\omega t)\,e^{-\lambda r}.
\end{aligned}
\]

Az \(r\) a hullámforrástól mért távolság, az \(A\) az induló amplitúdó, a \(k\) a térbeli hullámszám, az \(\omega\) az időbeli változás sebességét szabályozza. Az \(e^{-\lambda r}\) tényező **csillapítja** a hullámot: minél távolabb vagyunk a forrástól, annál kisebb lesz a kilengés. Processingben ezt `exp(-lambda * r)` formában írjuk.

**Rögzített időpillanat.** A `time` értéke nulla, a `noLoop()` miatt csak egyszer rajzolunk. Ebben a változatban a térben változó hullámmintát vizsgáljuk, az időbeli mozgás még nem szerepel.

:::processing-example title="Hullámfelület – egy időpillanat" image="media/13-hullam-egy.webp"
```processing
float time = 0;

void setup() {
  size(900, 620, P3D);
}

void draw() {
  background(10, 20, 34);
  lights();
  translate(width/2, height/2, 0);
  rotateX(PI/3);
  rotateZ(-PI/5);
  stroke(25, 79, 112, 75);
  strokeWeight(0.5);

  int n = 75;
  float step = 520.0/n;
  for (int i = 0; i < n; i++) {
    float y0 = -260 + i*step;
    float y1 = y0 + step;
    beginShape(QUAD_STRIP);
    for (int j = 0; j <= n; j++) {
      float x = -260 + j*step;
      float z0 = surfaceHeight(x, y0, time);
      float z1 = surfaceHeight(x, y1, time);
      fill(surfaceColor(z0)); vertex(x, y0, z0);
      fill(surfaceColor(z1)); vertex(x, y1, z1);
    }
    endShape();
  }
  noLoop();
}

float surfaceHeight(float x, float y, float t) {
  float r = sqrt(x*x + y*y);
  float k = 0.055;
  float omega = 2.2;
  float lambda = 0.006;
  return 105*sin(k*r - omega*t)*exp(-lambda*r);
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

**A hullám animálása.** A következő programból kikerül a `noLoop()`, és minden képkocka végén növeljük a `time` értékét. A `surfaceHeight()` képlete változatlan: a `sin(k*r - omega*t)` időfüggése miatt ugyanaz a felület most mozgásba jön. A színezés továbbra is a pillanatnyi magasságból készül.

:::processing-example title="Hullámfelület – terjedő hullám" image="media/14-hullam-mozgas.webp"
```processing
float time = 0;

void setup() {
  size(900, 620, P3D);
}

void draw() {
  background(10, 20, 34);
  lights();
  translate(width/2, height/2, 0);
  rotateX(PI/3);
  rotateZ(-PI/5);
  stroke(25, 79, 112, 75);
  strokeWeight(0.5);

  int n = 75;
  float step = 520.0/n;
  for (int i = 0; i < n; i++) {
    float y0 = -260 + i*step;
    float y1 = y0 + step;
    beginShape(QUAD_STRIP);
    for (int j = 0; j <= n; j++) {
      float x = -260 + j*step;
      float z0 = surfaceHeight(x, y0, time);
      float z1 = surfaceHeight(x, y1, time);
      fill(surfaceColor(z0)); vertex(x, y0, z0);
      fill(surfaceColor(z1)); vertex(x, y1, z1);
    }
    endShape();
  }
  time += 0.025;
}

float surfaceHeight(float x, float y, float t) {
  float r = sqrt(x*x + y*y);
  float k = 0.055;
  float omega = 2.2;
  float lambda = 0.006;
  return 105*sin(k*r - omega*t)*exp(-lambda*r);
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

**Két hullámforrás.** A végső változat két különböző pontból számítja a hullámok magasságát, majd összeadja őket. Ahol a két hullám azonos irányú kitérést okoz, ott nagyobb a felület elmozdulása; ellentétes kitérésnél részben kioltják egymást. A háló és a kamerabeállítás nem változik, csak a `surfaceHeight()` számítása.

:::processing-example title="Hullámfelület – két hullámforrás" image="media/15-hullam-ket.webp"
```processing
float time = 0;

void setup() {
  size(900, 620, P3D);
}

void draw() {
  background(10, 20, 34);
  lights();
  translate(width/2, height/2, 0);
  rotateX(PI/3);
  rotateZ(-PI/5);
  stroke(25, 79, 112, 75);
  strokeWeight(0.5);

  int n = 75;
  float step = 520.0/n;
  for (int i = 0; i < n; i++) {
    float y0 = -260 + i*step;
    float y1 = y0 + step;
    beginShape(QUAD_STRIP);
    for (int j = 0; j <= n; j++) {
      float x = -260 + j*step;
      float z0 = surfaceHeight(x, y0, time);
      float z1 = surfaceHeight(x, y1, time);
      fill(surfaceColor(z0)); vertex(x, y0, z0);
      fill(surfaceColor(z1)); vertex(x, y1, z1);
    }
    endShape();
  }
  time += 0.025;
}

float surfaceHeight(float x, float y, float t) {
  float k = 0.058;
  float omega = 2.0;
  float lambda = 0.007;
  float r1 = dist(x, y, -105, -85);
  float r2 = dist(x, y, 130, 55);
  float wave1 = 90*sin(k*r1 - omega*t)*exp(-lambda*r1);
  float wave2 = 90*sin(k*r2 - omega*t + 1.5)*exp(-lambda*r2);
  return wave1 + wave2;
}

color surfaceColor(float h) {
  float t = constrain(map(h, -125, 170, 0, 1), 0, 1);
  color deep = color(35, 88, 151);
  color mid = color(56, 191, 194);
  color high = color(248, 168, 106);
  if (t < 0.5) return lerpColor(deep, mid, 2*t);
  return lerpColor(mid, high, 2*t-1);
}
```
:::

A két hullámforrás hozzájárulását összeadjuk. Ahol a hullámok azonos előjellel térnek el az alapsíktól, egymást erősítik; ahol ellenkező előjelűek, részben kioltják egymást. A `dist(x, y, cx, cy)` a rácspont és az adott forrás távolságát számítja ki. A program az ismételt megvilágítás és a rács sűrűsége miatt erősebb gépet igényelhet; a `n` értéke csökkenthető.

A fejezetben minden felület ugyanolyan elven jelenik meg: véges számú pontot számítunk ki, majd szomszédos pontokból felületelemeket készítünk. Az eltérést az adatok forrása adja: az explicit felületnél egy magasságfüggvény, a paraméteres felületnél három koordinátafüggvény, a Bézier-felületnél pedig a kontrollpontokból számolt súlyozott összeg.

