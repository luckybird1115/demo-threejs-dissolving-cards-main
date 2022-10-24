uniform vec4 uColor;
uniform float uTime;
uniform float uFreq;
uniform float uBorder;
uniform bool uHovered;
uniform sampler2D uTexture;
uniform sampler2D uNoiseTexture;

varying vec2 vUv;

void main()
{
    float limit = (uFreq*uTime);
    //    float limit = 1.0-abs(2.0*fract(uFreq*uTime) - 1.0);

    vec4 textureColor = texture2D(uTexture, vUv);
    float level = texture2D(uNoiseTexture, vUv).x;
    float highlighter = uHovered ? 1.4 : 1.0;
    if (textureColor.a < 0.85) {
        gl_FragColor = vec4(0.0);
    } else if (level > limit - uBorder && level < limit) {
        gl_FragColor = highlighter * uColor * textureColor.a;
    } else {
        gl_FragColor = highlighter* textureColor * step(limit, level);

        // Adjust brightness
        gl_FragColor = 2.0*gl_FragColor;
    }

}
