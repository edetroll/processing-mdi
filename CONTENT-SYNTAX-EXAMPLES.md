# Tartalmi szintaxis – minták

Ez a fájl csak szerkesztői segédlet, nem része a navigációnak.

## Alfejezetek

```markdown
## Ablak létrehozása
### Az ablak mérete
```

A `##` és `###` címsorok automatikusan megjelennek az oldalsávban.

## Processing-kódblokk

````markdown
```processing
void setup() {
  size(500, 300);
  background(255);
}
```
````

## Kép

```markdown
![Rövid képaláírás](media/pelda.webp)
```

## Kód + eredmény

````markdown
:::processing-example title="Példa címe" image="media/pelda.webp"
```processing
void setup() {
  size(500, 300);
}
```

Rövid megfigyelési szempont vagy magyarázat.
:::
````
