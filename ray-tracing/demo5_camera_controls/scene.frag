#version 330 core
in vec2 fragCoord;
out vec4 FragColor;

uniform float cameraX;
uniform float cameraY;
uniform float cameraZ;

#define MAX_BOUNCES 5
#define MAX_SPHERES 4
#define EPSILON 0.001

struct Sphere {
    vec3 center;
    float radius;
    vec3 color;
    float reflectivity;
    float transparency;
    float ior;
};

Sphere spheres[MAX_SPHERES];

void initScene() {
    spheres[0] = Sphere(vec3(-0.8, 0.0, -3.0), 0.5, vec3(1, 0.2, 0.2), 0.5, 0.0, 1.0);
    spheres[1] = Sphere(vec3(0.8, 0.0, -3.2), 0.5, vec3(0.2, 0.8, 1), 0.3, 0.0, 1.0);
    spheres[2] = Sphere(vec3(0.0, -1001.0, -3.0), 1000.0, vec3(1), 0.0, 0.0, 1.0);
    spheres[3] = Sphere(vec3(0.0, 0.5, -5.0), 0.4, vec3(1.0, 1.0, 0.6), 0.05, 0.9, 1.5);
}

vec3 rayDirection(vec2 uv) {
    uv *= vec2(1.0, 600.0 / 800.0);
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

void main() {
    initScene();
    vec3 ro = vec3(cameraX, cameraY, cameraZ);
    vec3 rd = rayDirection(fragCoord);
    vec3 color = vec3(0.0);
    vec3 mask = vec3(1.0);

    for (int bounce = 0; bounce < MAX_BOUNCES; ++bounce) {
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
            vec3 bg = mix(vec3(0.6, 0.8, 1.0), vec3(0.2, 0.3, 0.4), rd.y * 0.5 + 0.5);
            color += mask * bg;
            break;
        }

        Sphere s = spheres[hitIndex];
        vec3 hit = ro + rd * minT;
        vec3 normal = normalize(hit - s.center);
        vec3 lightDir = normalize(vec3(2.0, 4.0, 1.0) - hit);
        vec3 baseColor = (hitIndex == 2) ? getCheckerColor(hit) : s.color;

        bool inShadow = false;
        for (int i = 0; i < MAX_SPHERES; ++i) {
            if (i == hitIndex) continue;
            float t;
            if (intersectSphere(hit + normal * EPSILON, lightDir, spheres[i], t)) {
                inShadow = true;
                break;
            }
        }

        float diff = max(dot(normal, lightDir), 0.0);
        vec3 localColor = baseColor * (0.1 + (inShadow ? 0.2 : 1.0) * diff);
        color += mask * localColor;

        vec3 newRo, newRd;

        if (s.transparency > 0.0) {
            bool into = dot(rd, normal) < 0.0;
            vec3 n = into ? normal : -normal;
            float eta = into ? 1.0 / s.ior : s.ior;
            vec3 refrDir = refract(rd, n, eta);
            newRo = hit + (into ? -n : n) * EPSILON;
            newRd = refrDir;
            mask *= mix(vec3(1.0), baseColor, 0.3);
        } else if (s.reflectivity > 0.0) {
            vec3 reflDir = reflect(rd, normal);
            newRo = hit + normal * EPSILON;
            newRd = reflDir;
            mask *= mix(vec3(1.0), baseColor, 0.5);
        } else {
            break;
        }

        ro = newRo;
        rd = newRd;
    }

    FragColor = vec4(color, 1.0);
}
