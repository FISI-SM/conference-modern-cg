# Ray Tracing OpenGL Moderno

Este proyecto implementa un mini motor de **ray tracing en tiempo real** usando OpenGL moderno, shaders GLSL y cámara móvil controlada por teclado.

## 🎮 Controles

- `← ↑ → ↓`: Mover la cámara
- `+` / `-` : Zoom in / Zoom out

---

## 📁 Archivos necesarios

Coloca estos 3 archivos en la misma carpeta:

- `main.cpp`
- `scene.vert`
- `scene.frag`

---

## 🐧 Instalación en Linux

### Requisitos

```bash
sudo apt update
sudo apt install build-essential libglfw3-dev libglew-dev libgl1-mesa-dev
```

### Compilación

```bash
g++ main.cpp -lGL -lGLEW -lglfw -o demo
./demo
```

---

## 🪟 Instalación en Windows (MSYS2 recomendado)

### 1. Instalar MSYS2

Descarga desde [https://www.msys2.org](https://www.msys2.org)

### 2. Abrir MSYS2 MinGW 64-bit y ejecutar:

```bash
pacman -Syu
pacman -S mingw-w64-x86_64-gcc mingw-w64-x86_64-glew mingw-w64-x86_64-glfw
```

### 3. Compilar

```bash
g++ main.cpp -o demo.exe -lglfw -lglew32 -lopengl32
```

### 4. Ejecutar

```bash
./demo.exe
```

---

## 🍎 Instalación en macOS

### 1. Instalar Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Instalar dependencias

```bash
brew install glew glfw
```

### 3. Compilar

```bash
g++ main.cpp -std=c++11 -o demo -framework OpenGL -lglfw -lglew
```

### 4. Ejecutar

```bash
./demo
```

---

## 📌 Notas

- Asegúrate de que los archivos `.vert` y `.frag` estén en el mismo directorio que el ejecutable.
- En caso de error en la compilación, revisa que las librerías estén bien instaladas y vinculadas.
