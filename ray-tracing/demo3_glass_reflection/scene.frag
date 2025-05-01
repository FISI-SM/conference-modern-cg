#version 330 core
in vec2 fragCoord;
out vec4 FragColor;

#define MAX_BOUNCES 3
#define MAX_SPHERES 4
#define EPSILON 0.001

struct Sphere {
    vec3 center;
    float radius;
    vec3 color;
    float reflectivity;
};

Sphere spheres[MAX_SPHERES];

void initScene() {
    spheres[0] = Sphere(vec3(-0.8, 0.0, -3.0), 0.5, vec3(1, 0.2, 0.2), 0.3);
    spheres[1] = Sphere(vec3(0.8, 0.0, -3.2), 0.5, vec3(0.2, 0.8, 1), 0.6);
    spheres[2] = Sphere(vec3(0.0, -1001.0, -3.0), 1000.0, vec3(1), 0.0); // plano (tablero)
    spheres[3] = Sphere(vec3(0.0, 0.5, -5.0), 0.4, vec3(0.9, 0.9, 0.3), 0.1);
}

vec3 rayDirection(vec2 uv) {
    uv *= vec2(1.0, 600.0 / 800.0); // aspect ratio
    return normalize(vec3(uv, -1.5));
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

vec3 getCheckerColor(vec3 p) {
    float scale = 1.0;
    int x = int(floor(p.x * scale));
    int z = int(floor(p.z * scale));
    return mod(x + z, 2) == 0 ? vec3(1.0) : vec3(0.0);
}

vec3 trace(vec3 ro, vec3 rd, int maxBounces) {
    vec3 finalColor = vec3(0.0);
    vec3 attenuation = vec3(1.0);

    for (int bounce = 0; bounce <= maxBounces; ++bounce) {
        float minT = 1e20;
        int hitIndex = -1;

        for (int i = 0; i < MAX_SPHERES; ++i) {
            float t;
            if (intersectSphere(ro, rd, spheres[i], t) && t > 0.0 && t < minT) {
                minT = t;
                hitIndex = i;
            }
        }

        if (hitIndex == -1) {
            vec3 background = mix(vec3(0.6, 0.8, 1.0), vec3(0.2, 0.3, 0.4), rd.y * 0.5 + 0.5);
            finalColor += attenuation * background;
            break;
        }

        Sphere s = spheres[hitIndex];
        vec3 hit = ro + rd * minT;
        vec3 normal = normalize(hit - s.center);
        vec3 light = normalize(vec3(2.0, 4.0, 1.0) - hit);

        // sombra
        bool inShadow = false;
        for (int i = 0; i < MAX_SPHERES; ++i) {
            if (i == hitIndex) continue;
            float t;
            if (intersectSphere(hit + normal * EPSILON, light, spheres[i], t)) {
                inShadow = true;
                break;
            }
        }

        vec3 baseColor = (hitIndex == 2) ? getCheckerColor(hit) : s.color;
        float diff = max(dot(normal, light), 0.0);
        vec3 local = baseColor * (0.1 + (inShadow ? 0.2 : 1.0) * diff);

        finalColor += attenuation * local;

        // reflexión
        attenuation *= s.reflectivity;
        if (attenuation.x < 0.01 && attenuation.y < 0.01 && attenuation.z < 0.01)
            break;

        ro = hit + normal * EPSILON;
        rd = reflect(rd, normal);
    }

    return finalColor;
}

void main() {
    initScene();
    vec3 ro = vec3(0, 0, 2);
    vec3 rd = rayDirection(fragCoord);
    vec3 color = trace(ro, rd, MAX_BOUNCES);
    FragColor = vec4(color, 1.0);
}
