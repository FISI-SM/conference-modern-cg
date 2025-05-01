#version 330 core
in vec2 fragCoord;
out vec4 FragColor;

#define MAX_SPHERES 3
#define EPSILON 0.001

struct Sphere {
    vec3 center;
    float radius;
    vec3 color;
};

Sphere spheres[MAX_SPHERES];

void initScene() {
    spheres[0] = Sphere(vec3(-0.8, 0.0, -3.0), 0.5, vec3(1.0, 0.3, 0.3));
    spheres[1] = Sphere(vec3(0.6, 0.0, -3.5), 0.6, vec3(0.3, 1.0, 0.3));
    spheres[2] = Sphere(vec3(0.0, -1001.0, -3.0), 1000.0, vec3(0.8, 0.8, 0.8)); // plano suelo
}

vec3 rayDirection(vec2 fragCoord) {
    vec2 uv = fragCoord;
    uv *= vec2(1.0, 600.0 / 800.0); // aspect ratio
    return normalize(vec3(uv, -1.0));
}

bool intersectSphere(vec3 ro, vec3 rd, Sphere s, out float t) {
    vec3 oc = ro - s.center;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - s.radius * s.radius;
    float h = b * b - c;
    if (h < 0.0) return false;
    h = sqrt(h);
    t = -b - h;
    return true;
}

vec3 computeColor(vec3 ro, vec3 rd) {
    float minT = 1e20;
    int hitIndex = -1;

    for (int i = 0; i < MAX_SPHERES; ++i) {
        float t;
        if (intersectSphere(ro, rd, spheres[i], t)) {
            if (t < minT && t > 0.0) {
                minT = t;
                hitIndex = i;
            }
        }
    }

    if (hitIndex == -1) {
        // fondo con gradiente
        float g = 0.5 + 0.5 * rd.y;
        return mix(vec3(0.6, 0.7, 0.9), vec3(0.2, 0.3, 0.4), g);
    }

    Sphere s = spheres[hitIndex];
    vec3 hitPoint = ro + rd * minT;
    vec3 normal = normalize(hitPoint - s.center);
    vec3 lightPos = vec3(2.0, 5.0, 0.0);
    vec3 lightDir = normalize(lightPos - hitPoint);

    // Sombra (oclusión)
    bool inShadow = false;
    for (int i = 0; i < MAX_SPHERES; ++i) {
        if (i == hitIndex) continue;
        float t;
        if (intersectSphere(hitPoint + normal * EPSILON, lightDir, spheres[i], t)) {
            inShadow = true;
            break;
        }
    }

    // Iluminación difusa + ambiente
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 ambient = 0.1 * s.color;
    vec3 diffuse = s.color * diff * (inShadow ? 0.2 : 1.0);

    return ambient + diffuse;
}

void main() {
    initScene();
    vec3 ro = vec3(0.0, 0.0, 2.0); // cámara
    vec3 rd = rayDirection(fragCoord);
    vec3 color = computeColor(ro, rd);
    FragColor = vec4(color, 1.0);
}
