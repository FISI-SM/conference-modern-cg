#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <fstream>
#include <iostream>
#include <sstream>

// Variables de cámara
float cameraX = 0.0f;
float cameraY = 0.0f;
float cameraZ = 2.0f;

// Cargar código GLSL desde archivo
std::string loadShaderSource(const char* path) {
    std::ifstream file(path);
    std::stringstream ss;
    ss << file.rdbuf();
    return ss.str();
}

// Compilar shader y verificar errores
GLuint compileShader(GLenum type, const std::string& src) {
    GLuint shader = glCreateShader(type);
    const char* code = src.c_str();
    glShaderSource(shader, 1, &code, nullptr);
    glCompileShader(shader);
    GLint success;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        char log[512];
        glGetShaderInfoLog(shader, 512, nullptr, log);
        std::cerr << "Error al compilar shader:\n" << log << std::endl;
    }
    return shader;
}

// Manejo de teclas: movimiento y zoom
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods) {
    if (action == GLFW_PRESS || action == GLFW_REPEAT) {
        if (key == GLFW_KEY_LEFT)  cameraX -= 0.2f;
        if (key == GLFW_KEY_RIGHT) cameraX += 0.2f;
        if (key == GLFW_KEY_UP)    cameraY += 0.2f;
        if (key == GLFW_KEY_DOWN)  cameraY -= 0.2f;
        if (key == GLFW_KEY_EQUAL || key == GLFW_KEY_KP_ADD) cameraZ -= 0.2f;
        if (key == GLFW_KEY_MINUS || key == GLFW_KEY_KP_SUBTRACT) cameraZ += 0.2f;
    }
}

int main() {
    // Inicialización de GLFW y OpenGL
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    GLFWwindow* win = glfwCreateWindow(800, 600, "Ray Tracing - Cámara Móvil", nullptr, nullptr);
    glfwMakeContextCurrent(win);
    glewInit();

    glfwSetKeyCallback(win, key_callback);

    glViewport(0, 0, 800, 600);
    glClearColor(0, 0, 0, 1);

    // Cuadrado de pantalla completa
    float quad[] = { -1, -1,  1, -1,  -1, 1,  1, 1 };
    GLuint vao, vbo;
    glGenVertexArrays(1, &vao); glBindVertexArray(vao);
    glGenBuffers(1, &vbo); glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(quad), quad, GL_STATIC_DRAW);
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), 0);
    glEnableVertexAttribArray(0);

    // Cargar y compilar shaders
    std::string vertSrc = loadShaderSource("scene.vert");
    std::string fragSrc = loadShaderSource("scene.frag");
    GLuint vs = compileShader(GL_VERTEX_SHADER, vertSrc);
    GLuint fs = compileShader(GL_FRAGMENT_SHADER, fragSrc);
    GLuint program = glCreateProgram();
    glAttachShader(program, vs); glAttachShader(program, fs);
    glLinkProgram(program);
    glUseProgram(program);

    // Loop principal
    while (!glfwWindowShouldClose(win)) {
        glClear(GL_COLOR_BUFFER_BIT);

        // Pasar uniforms de cámara
        glUseProgram(program);
        glUniform1f(glGetUniformLocation(program, "cameraX"), cameraX);
        glUniform1f(glGetUniformLocation(program, "cameraY"), cameraY);
        glUniform1f(glGetUniformLocation(program, "cameraZ"), cameraZ);

        glBindVertexArray(vao);
        glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

        glfwSwapBuffers(win);
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;
}
