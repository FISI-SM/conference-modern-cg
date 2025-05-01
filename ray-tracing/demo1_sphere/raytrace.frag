#version 330 core
in vec2 fragCoord;
out vec4 FragColor;

vec3 rayDirection(vec2 fragCoord) {
    vec2 uv = fragCoord;
    uv *= vec2(1.0, 600.0 / 800.0); // aspect ratio
    return normalize(vec3(uv, -1.0));
}

bool intersectSphere(vec3 ro, vec3 rd, vec3 center, float radius, out float t) {
    vec3 oc = ro - center;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - radius * radius;
    float h = b * b - c;
    if (h < 0.0) return false;
    h = sqrt(h);
    t = -b - h;
    return true;
}

void main() {
    vec3 ro = vec3(0.0, 0.0, 2.0);             // Ray origin (camera)
    vec3 rd = rayDirection(fragCoord);        // Ray direction

    vec3 sphereCenter = vec3(0.0, 0.0, 0.0);
    float radius = 0.6;
    float t;

    vec3 color = vec3(0.1); // fondo oscuro
    if (intersectSphere(ro, rd, sphereCenter, radius, t)) {
        vec3 hit = ro + rd * t;
        vec3 normal = normalize(hit - sphereCenter);
        vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
        float diff = max(dot(normal, lightDir), 0.0);
        color = vec3(diff);
    }

    FragColor = vec4(color, 1.0);
}
