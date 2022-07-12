export default {
  triangle: (width: number = 10, length: number = 15) => {
    const halfLength = length / 2;
    const path = `M ${-halfLength},0 L ${halfLength},-${width / 2} L ${halfLength},${width / 2
      } Z`;
    return path;
  },
  vee: (width: number = 15, length: number = 20) => {
    const halfLength = length / 2;
    const path = `M ${-halfLength},0 L ${halfLength},-${width / 2}
        L ${length / 6},0 L ${halfLength},${width / 2} Z`;
    return path;
  },
  circle: (r: number = 5) => {
    const path = `M ${-r}, 0
            a ${r},${r} 0 1,0 ${r * 2},0
            a ${r},${r} 0 1,0 ${-r * 2},0`;
    return path;
  },
  rect: (width: number = 10, length: number = 10) => {
    const halfLength = length / 2;
    const path = `M ${-halfLength},${-width / 2} 
        L ${halfLength},${-width / 2} 
        L ${halfLength},${width / 2} 
        L ${-halfLength},${width / 2} Z`;
    return path;
  },
  diamond: (width: number = 15, length: number = 15) => {
    const halfLength = length / 2;
    const path = `M ${-halfLength},0 
        L 0,${-width / 2} 
        L ${halfLength},0 
        L 0,${width / 2} Z`;
    return path;
  },
  triangleRect: (
    tWidth: number = 15,
    tLength: number = 15,
    rWidth: number = 15,
    rLength: number = 3,
    gap: number = 5,
  ) => {
    const begin = -(tLength) / 2;
    // const begin = d * 2;
    const rectBegin = begin + tLength + gap;
    const path = `M ${begin},0 L ${begin + tLength},-${tWidth / 2} L ${begin + tLength},${tWidth / 2
      } Z
            M ${rectBegin}, -${rWidth / 2}
            L ${rectBegin + rLength} -${rWidth / 2}
            L ${rectBegin + rLength} ${rWidth / 2}
            L ${rectBegin} ${rWidth / 2}
            Z`;
    return path;
  },
};
