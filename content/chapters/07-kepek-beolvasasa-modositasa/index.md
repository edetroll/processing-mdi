# Képek beolvasása és módosítása

Az előző fejezetben a kétdimenziós tömbben tárolt számokból állítottuk elő a megjelenő mintát. Most egy **már létező képből** indulunk ki. A Processing be tud olvasni egy képfájlt, majd megjelenítheti, módosíthatja vagy akár teljesen más alakzatokból is újrarajzolhatja. A lényeg az, hogy egy kép sok képpontból áll, és minden képponthoz színadat tartozik.

A fejezet valamennyi példája ugyanazt a mellékelt fényképet használja. Így a különböző műveletek eredménye közvetlenül összehasonlítható. [A `portre.jpg` mintakép letöltése](media/portre.jpg). A kép forrása a NASA egyik fényképe, a [scikit-image nyilvános mintaképei](https://scikit-image.org/docs/stable/api/skimage.data.html#skimage.data.astronaut) közül; a dokumentáció közkincs státuszt jelöl.

**A fájl előkészítése.** A `portre.jpg` fájlt a Processing-vázlat (*sketch*) `data` mappájába kell helyezni. Ezt a Processing **Sketch → Add File...** parancsával is megtehetjük. A következő kódok ezután változtatás nélkül futtathatók. Saját képnél a fájl nevét és szükség esetén a rajzfelület méretét is módosítani kell.

## Kép betöltése és megjelenítése {#betoltes}

A Processing a képeket a `PImage` típussal kezeli. Egy ilyen objektum nemcsak a megjelenő képet képviseli, hanem annak méretét és képpontadatait is tartalmazza.

:::processing-example title="A mellékelt mintakép megjelenítése" image="media/01-kep.webp"
```processing
PImage photo;

void setup() {
  size(512, 512);

  photo = loadImage("portre.jpg");
  image(photo, 0, 0);
}
```
:::

A `loadImage()` beolvassa a megadott fájlt, és az eredményt a `photo` változóban tároljuk. Az `image(photo, 0, 0)` a kép bal felső sarkát a rajzfelület `(0, 0)` pontjába helyezi. Az `image()` további két paraméterrel a megjelenített szélességet és magasságot is megkaphatja, például `image(photo, 0, 0, 300, 300)`. Ettől a megjelenített méret változik meg, nem az eredeti fájl.

## Szűrők és színmintavétel {#szurok}

A Processing néhány gyakori képmódosítást kész műveletként biztosít. A `filter()` például szürkeárnyalatossá alakíthat egy képet, csökkentheti a színárnyalatok számát vagy erősebben elkülönítheti a világos és sötét területeket.

**1. változat – szürkeárnyalatok.** Az eredeti képet a bal oldalon, a módosítottat a jobb oldalon jelenítjük meg.

:::processing-example title="Eredeti és szürkeárnyalatos kép" image="media/02-szurke.webp"
```processing
PImage photo;
PImage grayPhoto;

void setup() {
  size(1024, 512);

  photo = loadImage("portre.jpg");
  grayPhoto = photo.get();
  grayPhoto.filter(GRAY);

  image(photo, 0, 0);
  image(grayPhoto, 512, 0);
}
```
:::

A `photo.get()` **másolatot készít** a képről. Erre azért van szükség, mert a `filter()` magát a képet módosítja, amelyen meghívjuk. A másolat használatával az eredeti változat is megmarad, és a két eredmény egymás mellett látható. A `GRAY` a kép színeit szürkeárnyalatokra cseréli.

**2. változat – kevesebb tónus és küszöbölés.** Két eltérő szűrőt próbálunk ki ugyanazon a fényképen.

:::processing-example title="Színfokozatok csökkentése és küszöbölés" image="media/03-szurok.webp"
```processing
PImage photo;
PImage reduced;
PImage blackWhite;

void setup() {
  size(1024, 512);

  photo = loadImage("portre.jpg");

  reduced = photo.get();
  reduced.filter(POSTERIZE, 4);

  blackWhite = photo.get();
  blackWhite.filter(THRESHOLD, 0.5);

  image(reduced, 0, 0);
  image(blackWhite, 512, 0);
}
```
:::

A `POSTERIZE` csökkenti az egyes színcsatornák lehetséges értékeinek számát. A `4` itt a **csatornánkénti színfokozatok száma**, nem a teljes kép színeinek száma. A `THRESHOLD` az adott küszöb alapján fekete vagy fehér képpontokra alakítja a képet. Az `0.5` a küszöbszintet jelöli a `0` és `1` közötti tartományban.

**Színmintavétel az egérrel.** Egy kép bármely pontjának színét a `get(x, y)` metódussal kérhetjük le. A következő program kattintáskor megjegyzi a kiválasztott képpont színét, és azt egy kis téglalapban is megjeleníti.

:::processing-example title="Képpont színének lekérése kattintással" image="media/04-szinminta.webp"
```processing
PImage photo;
color selected;

void setup() {
  size(512, 512);
  photo = loadImage("portre.jpg");
  selected = photo.get(256, 256);
}

void draw() {
  image(photo, 0, 0);

  stroke(255);
  strokeWeight(3);
  fill(selected);
  rect(20, 20, 110, 94);
}

void mousePressed() {
  if (mouseX >= 0 && mouseX < width &&
      mouseY >= 0 && mouseY < height) {
    selected = photo.get(mouseX, mouseY);
  }
}
```
:::

A `selected` egy `color` típusú változó; minden kattintáskor új színt tárolunk benne. A `draw()` folyamatosan az eredeti képet és az utoljára kiválasztott színt jeleníti meg. A kattintás ellenőrzése megakadályozza, hogy a program a kép területén kívülről próbáljon színt lekérni.

## A képpontadatok közvetlen módosítása {#keppontok}

A `get()` egyszerű módszer egy képpont színének lekérésére. Ha azonban **sok képpontot** szeretnénk átalakítani, célszerű a kép `pixels[]` tömbjét használni. Ez a tömb a korábbi kétdimenziós rácshoz hasonló adatokat tárol, de **egydimenziós**: a képpontok színei soronként, egymás után következnek benne.

A kép `width` és `height` mezőiből tudjuk, hány képpont van egy sorban és hány sorunk van. A `(x, y)` helyhez tartozó index képlete `y * width + x`. Az első képpont indexe tehát `0`, a második sor első képpontjáé pedig `width`.

A `loadPixels()` hozzáférhetővé teszi a képpontok adatait, az `updatePixels()` pedig a módosítás után jelzi a Processingnek, hogy a kép tartalma megváltozott. Ha csak olvassuk egy kép `pixels[]` tömbjét, akkor az `updatePixels()` nem szükséges.

**Példa – színnegatív előállítása.** Minden eredeti képpont vörös, zöld és kék értékét kivonjuk 255-ből. Az eredményt egy új képen tároljuk, így az eredeti fénykép változatlan marad.

:::processing-example title="Színnegatív a képpontok módosításával" image="media/05-negativ.webp"
```processing
PImage photo;
PImage negative;

void setup() {
  size(512, 512);
  photo = loadImage("portre.jpg");

  negative = createImage(
    photo.width, photo.height, RGB
  );

  photo.loadPixels();
  negative.loadPixels();

  for (int y = 0; y < photo.height; y++) {
    for (int x = 0; x < photo.width; x++) {
      int i = y * photo.width + x;
      color c = photo.pixels[i];

      negative.pixels[i] = color(
        255 - red(c),
        255 - green(c),
        255 - blue(c)
      );
    }
  }

  negative.updatePixels();
  image(negative, 0, 0);
}
```
:::

A `createImage()` egy új, a megadott méretű, `RGB` színes képet hoz létre. A `red()`, `green()` és `blue()` egy szín megfelelő összetevőjét adja vissza. Minden képpont ugyanarra az indexre kerül az új képben, ezért az alakzatok helye megmarad, csak a színeik változnak. Ugyanezt az eredményt egyszerűbben a `filter(INVERT)` művelettel is előállíthatnánk; itt a saját képpontfeldolgozó algoritmus megértése volt a cél.

## Összetett példa: fényképből grafikus kompozíció {#raszterpontok}

A kép átalakításának nem feltétlenül az a célja, hogy új színértékeket írjunk a képpontok helyére. A kép információit felhasználhatjuk arra is, hogy **más alakzatokból hozzuk létre ugyanazt a látványt**. A következő feladathoz Chuck Close négyzetrácsra épülő portréi adnak ötletet. A [MoMA-ban található *Self-Portrait* (1991)](https://www.moma.org/collection/works/84179) színes formákból felépülő cellákat használ, amelyek távolabbról összefüggő képpé állnak össze. A nyomdai raszterpontok hasonló elven, pontok méretével és elrendezésével állítanak elő árnyalatokat. A mi programunk nem az eredeti művet másolja, hanem a **mintavételezés és az újrarajzolás** módszerét alkalmazza.

**1. változat – nagy színes négyzetek.** A képet 16 pixeles cellákra osztjuk. Minden cella középpontjában lekérjük az eredeti kép színét, és az egész cellát ezzel a színnel töltjük ki.

:::processing-example title="Mozaikkép négyzetekből" image="media/06-mozaik.webp"
```processing
PImage photo;

void setup() {
  size(512, 512);
  photo = loadImage("portre.jpg");

  noStroke();
  int step = 16;

  for (int y = 0; y < height; y += step) {
    for (int x = 0; x < width; x += step) {
      color c = photo.get(
        min(x + step / 2, width - 1),
        min(y + step / 2, height - 1)
      );

      fill(c);
      rect(x, y, step, step);
    }
  }
}
```
:::

Az `x` és az `y` a cella bal felső sarkát adják meg, a `step` a cella mérete. A `min()` biztosítja, hogy az utolsó soroknál és oszlopoknál se kérjünk le képpontot a kép határán kívül. A program nem tárol új kétdimenziós tömböt: az eredeti fényképet használja adathalmazként, és annak színeit más méretű négyzetekké alakítja.

**2. változat – világosságból számított pontméret.** A négyzeteket körökre cseréljük. A körök most feketék, méretük pedig attól függ, hogy a mintavételezett képpont mennyire világos. A sötétebb területeken nagyobb, a világosabbakon kisebb kör jelenik meg.

:::processing-example title="Fekete raszterpontokból összeálló kép" image="media/07-fekete-pontok.webp"
```processing
PImage photo;

void setup() {
  size(512, 512);
  photo = loadImage("portre.jpg");
  background(249, 246, 238);

  noStroke();
  fill(22, 27, 35);

  int step = 11;

  for (int y = 0; y < height; y += step) {
    for (int x = 0; x < width; x += step) {
      color c = photo.get(
        min(x + step / 2, width - 1),
        min(y + step / 2, height - 1)
      );

      float diameter = map(
        brightness(c), 0, 255,
        step * 0.98, step * 0.18
      );

      circle(x + step / 2.0,
             y + step / 2.0,
             diameter);
    }
  }
}
```
:::

A `brightness(c)` a szín világosságához kapcsolódó értéket ad vissza, alapértelmezett beállítás mellett `0` és `255` között. A `map()` ezt a tartományt alakítja át a körök lehetséges méretére. A leképezés szándékosan fordított: a `0`-hoz nagy, a `255`-höz kicsi átmérő tartozik. Nem szükséges az árnyalatok matematikájába mélyebben belemennünk; a lényeg, hogy az eredeti kép egy tulajdonsága **egy új alakzat méretét szabályozza**.

**3. változat – színes raszterpontok.** A pontok helye és mérete az előző változattal azonos elven számítható, de most a `fill()` az eredeti képpont színét használja. Így a kompozíció egyszerre őrzi meg a fénykép színeit és jeleníti meg azokat különálló geometriai elemekként.

:::processing-example title="Színes pontokból felépített kompozíció" image="media/08-szines-pontok.webp"
```processing
PImage photo;

void setup() {
  size(512, 512);
  photo = loadImage("portre.jpg");
  background(249, 246, 238);
  noStroke();

  int step = 11;

  for (int y = 0; y < height; y += step) {
    for (int x = 0; x < width; x += step) {
      color c = photo.get(
        min(x + step / 2, width - 1),
        min(y + step / 2, height - 1)
      );

      float diameter = map(
        brightness(c), 0, 255,
        step * 0.98, step * 0.30
      );

      fill(c);
      circle(x + step / 2.0,
             y + step / 2.0,
             diameter);
    }
  }
}
```
:::

**4. változat – interaktív pontsűrűség.** Az utolsó változatban a `draw()` minden képkockában újrarajzolja a kompozíciót. Az egér vízszintes pozíciója szabályozza a cellaméretet: bal oldalon sok apró, jobb oldalon kevesebb nagyobb kör jelenik meg.

:::processing-example title="Egérrel változtatható raszterpont-méret" image="media/09-interaktiv.webp"
```processing
PImage photo;

void setup() {
  size(512, 512);
  photo = loadImage("portre.jpg");
  noStroke();
  frameRate(15);
}

void draw() {
  background(249, 246, 238);

  int step = constrain(
    (int) map(mouseX, 0, width, 8, 26),
    8, 26
  );

  for (int y = 0; y < height; y += step) {
    for (int x = 0; x < width; x += step) {
      color c = photo.get(
        min(x + step / 2, width - 1),
        min(y + step / 2, height - 1)
      );

      float diameter = map(
        brightness(c), 0, 255,
        step * 0.98, step * 0.30
      );

      fill(c);
      circle(x + step / 2.0,
             y + step / 2.0,
             diameter);
    }
  }
}
```
:::

A `constrain()` az eredményt a megadott határok között tartja, így a cellaméret itt soha nem lesz `8`-nál kisebb vagy `26`-nál nagyobb. A `frameRate(15)` másodpercenként legfeljebb körülbelül 15 újrarajzolást kér; ez elegendő az egérmozgás követéséhez, és mérsékli a sok kör kirajzolásának terhelését. A példából látható, hogy **ugyanabból az eredeti képből eltérő részletességű alkotásokat** hozhatunk létre csupán a mintavételezés szabályainak megváltoztatásával.

**A kész kép mentése.** Ha egy statikus programban már kirajzoltuk a végeredményt, a `save("eredmeny.png")` utasítással fájlba menthetjük a rajzfelület tartalmát. Az interaktív változatnál célszerű inkább egy billentyűeseményben menteni, például:

```processing
void keyPressed() {
  if (key == 's') {
    save("raszter.png");
  }
}
```

Az így létrejött fájl a Processing-vázlat mappájába kerül. A kép más programokban is felhasználható, vagy egy további Processing-feladat kiinduló képe lehet.

## Fotómozaik képekből {#fotomozaik}

A korábbi példában egy fénykép egyes területeit színes négyzetekkel vagy körökkel helyettesítettük. Hasonló elvet alkalmazhatunk akkor is, ha a nagy képet nem egyszerű geometriai alakzatokkal, hanem **sok kisebb képpel** szeretnénk újraalkotni. A módszert fotómozaiknak nevezzük.

Ehhez szükségünk van egy célképre és egy kisebb képekből álló gyűjteményre. A program kiszámítja a gyűjtemény minden képének átlagos színét. Ezután a célképet azonos méretű területekre osztja, és minden területhez kiválasztja azt a kis képet, amelynek átlagos színe a legjobban hasonlít a terület átlagos színére. Az összehasonlításkor nem az egyes alakzatokat vagy tárgyakat vizsgáljuk, kizárólag a színeket.

A mellékelt [fotómozaik-adatcsomag](media/photomozaik-adatok.zip) tartalmazza a már ismert `portre.jpg` képet és 25 kisebb képet (`tile-00.jpg`–`tile-24.jpg`). A kis képek a közkincs mintafotó különböző kivágásai; a módszer ugyanígy működik 25 egymástól független fényképpel is. A ZIP-ben található `data` mappát a Processing-vázlat mappájába kell másolni.

**1. változat – képek és átlagos színeik.** Elsőként beolvassuk a 25 mintaképet, és mindegyikhez kiszámítunk egy átlagos RGB-színt. Ehhez a képpontok vörös, zöld és kék összetevőit külön-külön összeadjuk, majd elosztjuk a képpontok számával. A mintaképeket és alattuk az átlagos színüket rácsban jelenítjük meg.

:::processing-example title="Fotómozaik – 1. változat: mintaképek" image="media/10-mozaik-konyvtar.webp"
```processing
PImage[] tiles = new PImage[25];
color[] averages = new color[25];

void setup() {
  size(500, 500);
  background(242, 240, 234);
  noStroke();

  for (int i = 0; i < tiles.length; i++) {
    String file = "tile-" + nf(i, 2) + ".jpg";
    tiles[i] = loadImage(file);
    averages[i] = averageColor(tiles[i]);

    int x = 20 + (i % 5) * 96;
    int y = 20 + (i / 5) * 96;

    image(tiles[i], x, y, 78, 78);
    fill(averages[i]);
    rect(x, y + 78, 78, 8);
  }
}

color averageColor(PImage img) {
  img.loadPixels();
  float r = 0, g = 0, b = 0;

  for (int i = 0; i < img.pixels.length; i++) {
    color c = img.pixels[i];
    r += red(c);
    g += green(c);
    b += blue(c);
  }

  int count = img.pixels.length;
  return color(r / count, g / count, b / count);
}
```
:::

A `tiles` a 25 képet, az `averages` pedig ezek átlagos színét tárolja. A `nf(i, 2)` az `i` számot legalább két számjeggyel írja le: például `0` helyett `00` lesz. Így a program egyszerű ciklussal be tudja olvasni az előre elnevezett képeket. A megjelenítésnél az `i % 5` az oszlopot, az `i / 5` egész osztás a sort határozza meg.

**2. változat – a célkép területeinek átlagolása.** Korábban egy cella középpontjának színét olvastuk ki. Most az egész 32×32 pixeles terület átlagos színét számítjuk ki. A `get(x, y, w, h)` a képből egy téglalap alakú részletet ad vissza új `PImage` objektumként; ennek átlagát a már megismert metódussal határozzuk meg.

:::processing-example title="Fotómozaik – 2. változat: cellaátlagok" image="media/11-mozaik-atlagok.webp"
```processing
PImage photo;

void setup() {
  size(512, 512);
  photo = loadImage("portre.jpg");
  noStroke();

  int cell = 32;

  for (int y = 0; y < height; y += cell) {
    for (int x = 0; x < width; x += cell) {
      PImage patch = photo.get(x, y, cell, cell);
      fill(averageColor(patch));
      rect(x, y, cell, cell);
    }
  }
}

color averageColor(PImage img) {
  img.loadPixels();
  float r = 0, g = 0, b = 0;

  for (int i = 0; i < img.pixels.length; i++) {
    color c = img.pixels[i];
    r += red(c);
    g += green(c);
    b += blue(c);
  }

  int count = img.pixels.length;
  return color(r / count, g / count, b / count);
}
```
:::

A cellák átlagolása fontos különbség az egyetlen képpontból történő mintavételhez képest. Egy világos és sötét részeket is tartalmazó terület átlagos színe egyik képpont színével sem feltétlenül egyezik meg, de jobban jellemzi a teljes területet.

**3. változat – a legmegfelelőbb kis kép kiválasztása.** Most összekapcsoljuk az előző két megoldást. Egy célterület átlagos színét összehasonlítjuk a 25 mintakép átlagos színével. Az RGB-színek különbségét a három színcsatorna eltéréseiből számítjuk. A legkisebb különbséget adó képet rajzoljuk a célterület helyére.

:::processing-example title="Fotómozaik – 3. változat: kész kompozíció" image="media/12-fotomozaik.webp"
```processing
PImage photo;
PImage[] tiles = new PImage[25];
color[] averages = new color[25];

void setup() {
  size(512, 512);
  photo = loadImage("portre.jpg");

  // A 25 kép és az átlagos színeik.
  for (int i = 0; i < tiles.length; i++) {
    String file = "tile-" + nf(i, 2) + ".jpg";
    tiles[i] = loadImage(file);
    averages[i] = averageColor(tiles[i]);
  }

  int cell = 32;

  for (int y = 0; y < height; y += cell) {
    for (int x = 0; x < width; x += cell) {
      PImage patch = photo.get(x, y, cell, cell);
      color target = averageColor(patch);

      int best = 0;
      float smallest = Float.MAX_VALUE;

      for (int i = 0; i < tiles.length; i++) {
        float difference = colorDifference(
          target, averages[i]
        );

        if (difference < smallest) {
          smallest = difference;
          best = i;
        }
      }

      image(tiles[best], x, y, cell, cell);
    }
  }
}

color averageColor(PImage img) {
  img.loadPixels();
  float r = 0, g = 0, b = 0;

  for (int i = 0; i < img.pixels.length; i++) {
    color c = img.pixels[i];
    r += red(c);
    g += green(c);
    b += blue(c);
  }

  int count = img.pixels.length;
  return color(r / count, g / count, b / count);
}

float colorDifference(color a, color b) {
  float dr = red(a) - red(b);
  float dg = green(a) - green(b);
  float db = blue(a) - blue(b);
  return dr * dr + dg * dg + db * db;
}
```
:::

A `smallest` változóban tároljuk az eddig talált legkisebb színkülönbséget, a `best` pedig az ehhez tartozó kép indexét. A `Float.MAX_VALUE` nagyon nagy kezdőérték, ezért az első összehasonlítás biztosan le tudja cserélni. A `colorDifference()` kiszámítja a vörös, zöld és kék összetevők eltérésének négyzetösszegét; ennek minimumát keressük. A négyzetgyök kiszámítása itt fölösleges, mert az a sorrenden nem változtatna.

A programban a mintaképek átlagát elegendő **egyszer, a `setup()` elején** kiszámítani. A célkép celláinak feldolgozása szintén egyszer történik; nincs szükség folyamatos `draw()` ciklusra. Ha más fényképeket szeretnénk használni, elég a `data` mappában a mintaképeket lecserélni, a fájlnevek megtartásával. Nagyobb képtárból jobb egyezések adódhatnak; 25 kép esetén a mozaik szándékosan stilizált marad.

## Képrészletek átrendezése – Váli Lívia: PANELPROGRAM {#panelprogram}

Váli Lívia [*PANELPROGRAM* című munkája](https://www.behance.net/gallery/216288149/PANELPROGRAM?locale=da_DK) panelépületek fényképeit bontja fel és rendezi újra. A homlokzatok ismétlődő építészeti elemei az elmozdított és többször megjelenő részletek miatt geometrikus, helyenként töredezett mintázattá alakulnak. A következő feladatban ennek a képfeldolgozási elvnek egy egyszerű változatát valósítjuk meg; **nem az eredeti alkotás algoritmusát rekonstruáljuk**.

A feladatban nincsen szükség forgatásra vagy skálázásra. Az eredeti kép téglalap alakú részeit kiolvassuk, majd eltolva megjelenítjük. A `get(x, y, w, h)` egy adott helyen és méretben kivágott képrészletet ad vissza, amelyet az `image()` tetszőleges képernyő-koordinátára kirajzolhat.

A [panelépület mintaképét](media/panelhaz.jpg) vagy a [Processinghez előkészített adatcsomagot](media/panelprogram-adatok.zip) is letölthetjük. A mellékelt `panelhaz.jpg` a tananyag számára készített, sematikus épülethomlokzat, nem Váli Lívia művének másolata. A fájlt a Processing-vázlat `data` mappájába kell helyezni.

**1. változat – a kiinduló kép.** Először változtatás nélkül beolvassuk és megjelenítjük a képet. A későbbi változatokban mindig ugyanennek az eredeti képnek a részleteit használjuk, ezért az elmozdított részletek nem halmozódnak hibásan az előzőleg módosított képből.

:::processing-example title="PANELPROGRAM – 1. változat: eredeti homlokzat" image="media/13-panel-eredeti.webp"
```processing
PImage photo;

void setup() {
  size(640, 480);
  photo = loadImage("panelhaz.jpg");
  image(photo, 0, 0);
}
```
:::

**2. változat – vízszintes sávok eltolása.** A fényképet 24 pixel magas vízszintes sávokra bontjuk, majd minden sávot egy véletlen vízszintes eltéréssel rajzolunk ki. Az eltolás a kép egyes részleteit megtöri, miközben az emeletek és ablakok szerkezete még felismerhető marad.

:::processing-example title="PANELPROGRAM – 2. változat: eltolódó sávok" image="media/14-panel-savok.webp"
```processing
PImage photo;

void setup() {
  size(640, 480);
  photo = loadImage("panelhaz.jpg");
  background(21, 24, 26);

  int bandHeight = 24;

  for (int y = 0; y < photo.height; y += bandHeight) {
    PImage band = photo.get(
      0, y, photo.width, bandHeight
    );

    float shift = random(-35, 35);
    image(band, shift, y);
  }
}
```
:::

A `band` változó egy képrészletet tárol. A `random(-35, 35)` minden ismétlésben más vízszintes eltolást ad. A sávok az eredeti képből származnak; az eltérés kizárólag a rajzfelületen elfoglalt új helyüket módosítja.

**3. változat – helyi töredezettség.** Most az egész szélességű sávok helyett kisebb téglalapokat vágunk ki, és másik vízszintes pozícióban rajzoljuk ki őket. A teljes eredeti kép látható marad a háttérben; a hozzáadott részletek miatt az ablakok és erkélyek egy része megismétlődik.

:::processing-example title="PANELPROGRAM – 3. változat: képtöredékek" image="media/15-panel-blokkok.webp"
```processing
PImage photo;

void setup() {
  size(640, 480);
  photo = loadImage("panelhaz.jpg");
  image(photo, 0, 0);

  for (int y = 36; y < height - 32; y += 32) {
    int x = (int) random(20, 450);
    int w = (int) random(100, 190);
    int h = 26;

    w = min(w, photo.width - x);
    PImage fragment = photo.get(x, y, w, h);

    int shift = (int) random(-75, 75);
    int destinationX = constrain(
      x + shift, 0, width - w
    );

    image(fragment, destinationX, y);
  }
}
```
:::

A `fragment` minden ismétlésben másik téglalap alakú képrészletet tárol. A `constrain()` gondoskodik róla, hogy az áthelyezett töredék teljes egészében a rajzfelületen maradjon. A másolás és áthelyezés ezen a szinten még egyszerű képművelet, nem geometriai transzformáció.

**4. változat – időben változó eltolások.** A mozgó változatban az egyes sávokat már a `setup()` metódusban kivágjuk, és egy `PImage[]` tömbben tároljuk. A `draw()` így nem vágja ki minden képkockában újra ugyanazokat a képrészeket, hanem csak azok megjelenítési helyét számítja újra.

:::processing-example title="PANELPROGRAM – 4. változat: animált képsávok" image="media/16-panel-mozgo.webp"
```processing
PImage photo;
PImage[] bands = new PImage[24];
int bandHeight = 20;

void setup() {
  size(640, 480);
  photo = loadImage("panelhaz.jpg");

  for (int i = 0; i < bands.length; i++) {
    bands[i] = photo.get(
      0, i * bandHeight,
      photo.width, bandHeight
    );
  }
}

void draw() {
  image(photo, 0, 0);

  for (int i = 0; i < bands.length; i++) {
    float shift = 55 * sin(
      frameCount * 0.02f + i * 0.7f
    );

    image(bands[i], shift, i * bandHeight);
  }
}
```
:::

A `sin()` függvény itt időben folyamatosan változó, −1 és 1 közötti értéket ad, ezért a képsávok jobbra és balra mozognak. A `frameCount` minden képkockánál nő; a `i * 0.7` miatt nem minden sáv ugyanabban a pillanatban és ugyanabba az irányba mozdul el. Ez nem vászontranszformáció: a program ugyanazokat a kivágott képeket egyszerűen különböző pozíciókban jeleníti meg.

A két zárófeladat más-más módon használja a meglévő képek adatait. A fotómozaik **szín alapján választ** a kis képek közül, míg a képtöredékek átrendezése az eredeti **részletek helyzetét változtatja**. Mindkettőnél szükség van arra, hogy előbb megértsük a képek felépítését, és csak ezután fogalmazzuk meg a feldolgozás lépéseit.
