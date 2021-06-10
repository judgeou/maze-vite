function rgb_to_xyz_map (c) {
  if (c > 10) {
    const A = 0.055 * 255
    const D = 1.055 * 255
    return Math.pow((c + A) / D, 2.4)
  } else {
    const D = 12.92 * 255
    return c / D
  }
}

function xyz_to_lab_map (c) {
  if (c > 216.0 / 24389.0) {
    return Math.pow(c, 1 / 3)
  } else {
    return (24389.0 / 27.0 * c + 16.0) / 116.0
  }
}

function rgb_to_xyz (rgb) {
  let r = rgb_to_xyz_map(rgb[0]);
  let g = rgb_to_xyz_map(rgb[1]);
  let b = rgb_to_xyz_map(rgb[2]);

  return [
    r * 0.4124564390896921 + g * 0.357576077643909 + b * 0.18043748326639894,
    r * 0.21267285140562248 + g * 0.715152155287818 + b * 0.07217499330655958,
    r * 0.019333895582329317 + g * 0.119192025881303 + b * 0.9503040785363677,
  ]
}

function xyz_to_lab (xyz) {
  let x = xyz_to_lab_map(xyz[0] / 0.95047);
  let y = xyz_to_lab_map(xyz[1]);
  let z = xyz_to_lab_map(xyz[2] / 1.08883);

  return [
    (116.0 * y) - 16.0,
    500.0 * (x - y),
    200.0 * (y - z),
  ]
}

function rgb_to_lab(rgb) {
  return xyz_to_lab(rgb_to_xyz(rgb))
}

/**
 * 求两个 rgb 颜色的视觉差距，结果范围：0 ~ 100
 * @param {Number[]} rgbA 
 * @param {Number[]} rgbB 
 * @returns 
 */
function color_diff (rgbA, rgbB) {
  const labA = rgb_to_lab(rgbA)
  const labB = rgb_to_lab(rgbB)

  const dL = Math.abs(labA[0] - labB[0])
  const dA = Math.abs(labA[1] - labB[1])
  const dB = Math.abs(labA[2] - labB[2])

  return Math.sqrt(dL * dL + dA * dA + dB * dB)
}

export {
  color_diff
}
