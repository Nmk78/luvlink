export const getRandomGradient = (): [string, string] => {
  const gradients: readonly (readonly [string, string])[] = [
    //   ["#ff6b9d", "#ffa07a"],
    //   ["#ff9a9e", "#fad0c4"], // soft pink blend
    //   ["#fbc2eb", "#a6c1ee"], // cotton candy
    //   ["#ffdde1", "#ee9ca7"], // pastel rose
    //   ["#fccb90", "#d57eeb"], // peach to lavender
    //   ["#e0c3fc", "#f6d365"], // soft violet to sky
    //   ["#ffecd2", "#fcb69f"], // creamy orange
    //   ["#f6d365", "#fda085"], // warm sunshine

    //   ["#ff9a9e", "#fad0c4"],   // soft blush
    //   ["#fcbad3", "#ffdde1"],   // cherry blossom
    //   ["#fdaecb", "#fbc2eb"],   // bubblegum pink
    //   ["#ffb6b9", "#fae3d9"],   // peach cotton
    //   ["#ffcad4", "#fcd5ce"],   // pastel coral
    //   ["#ffe4e1", "#ffccd5"],   // soft flamingo

    //   ["#ff6b9d", "#ffa07a"],   // main brand tone (vibrant but smooth)
    // ["#ff9a9e", "#fad0c4"],   // soft but still noticeable
    // ["#fbc2eb", "#a6c1ee"],   // dreamy with decent contrast
    // ["#ffb6b9", "#fae3d9"],   // smooth peach-pink
    // ["#fdaecb", "#f78fb3"],   // lively rose-pink
    // ["#ff758c", "#ff7eb3"],   // rich bubblegum pink
    // ["#ff5f6d", "#ffc371"],   // rose to warm amber
    // ["#f093fb", "#f5576c"],   // pink-purple punch

    ["#ff6b9d", "#ffa07a"], 
    ["#f78fb3", "#fbc2eb"], // rose to cotton candy
    ["#f6608a", "#fcbad3"], // punchy pink to blossom
    ["#ff758c", "#ffb6b9"], // bold to peachy
    ["#ff5f6d", "#ffc2d1"], // rose to soft peach
    ["#f26a8d", "#fcbad3"], // watermelon to pastel pink
    ["#f5576c", "#fbc2eb"], // cherry to lavender-pink
    ["#ff7eb3", "#fad0c4"], // pink to soft blush
    ["#fc6076", "#ffd6db"], // strong coral to soft cotton
    ["#ff6f91", "#ffe3e0"], // warm rose to near white
    ["#f06292", "#fcdde1"], // saturated rose to light peach
    ["#f48fb1", "#fce4ec"], // gentle flamingo to pale pink
  ];

  const index = Math.floor(Math.random() * gradients.length);
  return [...gradients[index]];
};
