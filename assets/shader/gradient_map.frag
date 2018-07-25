//
// stupid gradient map shader with fixed color stops
//
uniform sampler2D uSampler;
varying vec2 vTextureCoord;
//varying vec2 vFilterCoord;

uniform vec4 stop0;
uniform vec4 stop1;
uniform vec4 stop2;
uniform vec4 stop3;
uniform vec4 stop4;
void main() {

    vec4 ownColor = texture2D(uSampler, vTextureCoord);
    float colorSample = ownColor.r;
    vec4 intermidiateColor;
    if (colorSample >= stop0.w && colorSample <= stop1.w) {
        float concreteSample = colorSample / (stop1.w - stop0.w);
        intermidiateColor = mix(stop0, stop1, concreteSample);
//        intermidiateColor.rgb *= ownColor.a;
        gl_FragColor = vec4(intermidiateColor.r, intermidiateColor.g, intermidiateColor.b, ownColor.a);// * uColor;
    } else if (colorSample > stop1.w && colorSample <= stop2.w) {
        float concreteSample = (colorSample - stop1.w) / (stop2.w - stop1.w);
        intermidiateColor = mix(stop1, stop2, concreteSample);
//        intermidiateColor.rgb *= ownColor.a;
        gl_FragColor = vec4(intermidiateColor.r, intermidiateColor.g, intermidiateColor.b, ownColor.a);// * uColor;
    } else if (colorSample > stop2.w && colorSample <= stop3.w) {
        float concreteSample = (colorSample - stop2.w) / (stop3.w - stop2.w);
        intermidiateColor = mix(stop2, stop3, concreteSample);
//        intermidiateColor.rgb *= ownColor.a;
        gl_FragColor = vec4(intermidiateColor.r, intermidiateColor.g, intermidiateColor.b, ownColor.a);// * uColor;
    } else if (colorSample > stop3.w && colorSample <= stop4.w) {
        float concreteSample = (colorSample - stop3.w) / (stop4.w - stop3.w);
        intermidiateColor = mix(stop3, stop4, concreteSample);
//        intermidiateColor.rgb *= ownColor.a;
        gl_FragColor = vec4(intermidiateColor.r, intermidiateColor.g, intermidiateColor.b, ownColor.a);// * uColor;
    } else {
        //gl_FragColor = vec4(colorSample, colorSample, colorSample, 1);
    }
}