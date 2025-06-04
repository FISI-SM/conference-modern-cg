#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <iostream>
#include <fstream>
#include <sstream>

// Datos del triángulo: posición (x, y) y color (r, g, b) por vértice
float vertices[] = {
    // Posición    // Color
    -0.5f, -0.5f,  1.0f, 0.0f, 0.0f, // Vértice 1: rojo
     0.5f, -0.5f,  0.0f, 1.0f, 0.0f, // Vértice 2: verde
     0.0f,  0.5f,  0.0f, 0.0f, 1.0f  // Vértice 3: azul
};

// Función para leer archivos de texto (shaders GLSL)
std::string readFile(const char* filename) {
    std::ifstream file(filename);
    std::stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

// Función para compilar un shader (vertex o fragment)
GLuint compileShader(GLenum type, const char* source) {
    GLuint shader = glCreateShader(type);                // Crear shader
    glShaderSource(shader, 1, &source, nullptr);         // Cargar código fuente
    glCompileShader(shader);                             // Compilar shader
    return shader;
}

int main() {
    // Inicializar GLFW y crear ventana
    glfwInit();
    GLFWwindow* window = glfwCreateWindow(800, 600, "Gamut Triángulo", nullptr, nullptr);
    glfwMakeContextCurrent(window);
    glewInit();  // Inicializar GLEW para acceder a funciones modernas de OpenGL

    // Crear VAO (Vertex Array Object)
    GLuint VAO;
    glGenVertexArrays(1, &VAO);
    glBindVertexArray(VAO);  // Asociar VAO

    // Crear VBO (Vertex Buffer Object) y cargar los datos de los vértices
    GLuint VBO;
    glGenBuffers(1, &VBO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    // Configurar atributos de vértice
    // Posición: 2 floats, offset 0
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    // Color: 3 floats, offset después de los 2 primeros
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(2 * sizeof(float)));
    glEnableVertexAttribArray(1);

    // Leer y compilar shaders desde archivo
    std::string vertexSrc = readFile("vertex_shader.glsl");
    std::string fragmentSrc = readFile("fragment_shader.glsl");

    GLuint vertexShader = compileShader(GL_VERTEX_SHADER, vertexSrc.c_str());
    GLuint fragmentShader = compileShader(GL_FRAGMENT_SHADER, fragmentSrc.c_str());

    // Crear programa de shaders y enlazar
    GLuint shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);

    // Bucle de renderizado
    while (!glfwWindowShouldClose(window)) {
        glClear(GL_COLOR_BUFFER_BIT);        // Limpiar pantalla
        glUseProgram(shaderProgram);         // Activar programa de shaders
        glBindVertexArray(VAO);              // Dibujar con el VAO configurado
        glDrawArrays(GL_TRIANGLES, 0, 3);    // Dibujar triángulo
        glfwSwapBuffers(window);             // Intercambiar buffers
        glfwPollEvents();                    // Procesar eventos
    }

    // Finalizar
    glfwTerminate();
    return 0;
}
