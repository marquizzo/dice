precision highp float;
#define PI 3.14159265
#define TAU 6.283185307

uniform float time;
varying vec2 vUv;

// Env matcap
varying vec3 vViewPosition;
varying vec3 vViewNormal;

uniform sampler2D uMap;
uniform sampler2D uEnvGold;
uniform sampler2D uEnvGlass;

vec4 LinearTosRGB( in vec4 value ) {
    return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}

void main() {
	vec3 viewDir = normalize( vViewPosition );

    ///////////////////// FRESNEL /////////////////////
    float fresnel = dot(vec3(0.0, 0.0, 1.0), vViewNormal);
    fresnel = step(0.95, fresnel);

	///////////////////// ENV MATCAP /////////////////////
	// Calc direction
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, vViewNormal ), dot( y, vViewNormal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

	// Matcap mapping by RGB channel
	vec4 colorMatte = vec4(0.0);
	vec4 colorGold = texture2D( uEnvGold, uv );
	vec4 colorGlass = texture2D( uEnvGlass, uv );

	vec4 dieMapping = texture2D( uMap, vUv );
	vec4 finalColor = mix(colorMatte, colorGold, dieMapping.r);
	finalColor = mix(finalColor, colorGlass, dieMapping.g);
	finalColor = mix(finalColor, colorGold, dieMapping.g * fresnel);

	gl_FragColor = finalColor;
}
