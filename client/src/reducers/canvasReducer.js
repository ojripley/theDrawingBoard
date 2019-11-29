
const ADD_USER = "ADD_USER";
const SET_INITIAL_PIXELS = "SET_INITIAL_PIXELS";
const SET_PIXEL = "SET_PIXEL";
const SET_CTX = "SET_CTX";
const REDRAW = "REDRAW";
const SET_POINTER = "SET_POINTER";
const SAVE = "SAVE";

export default function reducer(state, action) {
  console.log("---ACTION---", action);
  console.log('state:', state);

  switch (action.type) {
    case SET_INITIAL_PIXELS: {
      let whatIshappening = {
        ...state,
        pixelArrays: action.payload
      };
      return {
        ...state,
        pixelArrays: action.payload
      }
    }
    case SET_PIXEL: {

      if (state.pixelArrays[action.payload.page][action.payload.user]) {
        return {
          ...state,
          pixelArrays: {
            ...state.pixelArrays,
            [action.payload.page]: {
              ...state.pixelArrays[action.payload.page],
              [action.payload.user]: [...state.pixelArrays[action.payload.page][action.payload.user], action.payload.pixel]
            }
          }
        }
      } else {
        return {
          ...state,
          pixelArrays: {
            ...state.pixelArrays,
            [action.payload.page]: {
              ...state.pixelArrays[action.payload.page],
              [action.payload.user]: [action.payload.pixel]
            }
          }
        }
      }
    }
    case SET_CTX:
      return { ...state, ctx: action.payload };
    case SET_POINTER:
      return {
        ...state,
        pointers: {
          ...state.pointers,
          [action.payload.user]: action.payload.pixel
        }
      };
    case REDRAW: {
      state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height); //Clears canvas
      const w = state.ctx.canvas.width;
      const h = state.ctx.canvas.height;

      for (let user in state.pixelArrays[action.payload.page]) {
        let pixels = state.pixelArrays[action.payload.page][user]; //gets users pixel array
        //Reads colors
        let col = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},1)`
        let highlightCol = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},0.1)`
        state.ctx.lineJoin = "round";

        for (let i in pixels) {
          state.ctx.beginPath(); //start drawing a single line
          if (pixels[i].tool === "highlighter") {
            // console.log("lighting")
            // state.ctx.globalAlpha = 0.2;
            state.ctx.lineCap = 'butt';
            state.ctx.strokeStyle = highlightCol;
          } else {
            // console.log("not lighting")
            state.ctx.lineCap = 'round';
            state.ctx.strokeStyle = col;
          }
          state.ctx.lineWidth = pixels[i].strokeWidth || 1;
          // pixels[i].highlighting ? console.log("HIIII") : console.log("LOOOO");
          // console.log(state.color[user])
          if (pixels[i].dragging && i) { //if we're in dragging mode, use the last pixel
            state.ctx.moveTo(pixels[i - 1].x * w, pixels[i - 1].y * h);
          } else { //else use the current pixel, offset by 1px to the left
            state.ctx.moveTo(pixels[i].x * w, pixels[i].y * h - 1);
          }
          state.ctx.lineTo(pixels[i].x * w, pixels[i].y * h);//draw a line from point mentioned above to the current pixel
          // state.ctx.save();
          // state.ctx.fillRect(pixels[i].x * w, pixels[i].y * h, 10, 10); // fill in the pixel at (10,10)

          state.ctx.stroke();//draw the line
          state.ctx.closePath();//end the line
        }
      }
      for (let user in state.pointers) {
        if (state.pointers[user] && state.pointers[user].x) {
          state.ctx.beginPath();
          // state.ctx.arc(state.pointers[user].x * w, state.pointers[user].y * h, 20, 0, 2 * Math.PI);//center, r, stangle, endangle
          let x = state.pointers[user].x * w;
          let y = state.pointers[user].y * h;
          let r = state.pointers[user].strokeWidth / 2;

          let gradient = state.ctx.createRadialGradient(x, y, r, x, y, 10 * r);
          let col = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},1)`

          gradient.addColorStop(0, col);
          gradient.addColorStop(1, 'white');

          state.ctx.arc(x, y, 7 * r, 0, 2 * Math.PI);
          state.ctx.fillStyle = gradient;
          state.ctx.fill();
        }
      }
      return { ...state };
    }
    case SAVE: {
      let ctx = action.payload.ctx;

      ctx.drawImage(action.payload.backgroundImage, 0, 0, action.payload.backgroundImage.width, action.payload.backgroundImage.height);

      const w = ctx.canvas.width;
      const h = ctx.canvas.height;

      for (let user in state.pixelArrays[action.payload.page]) {

        let pixels = state.pixelArrays[action.payload.page][user]; //gets users pixel array
        //Reads colors
        let col = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},1)`
        let highlightCol = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},0.1)`
        ctx.lineJoin = "round";

        for (let i in pixels) {
          ctx.beginPath(); //start drawing a single line
          if (pixels[i].tool === "highlighter") {
            // console.log("lighting")
            // ctx.globalAlpha = 0.2;
            ctx.lineCap = 'butt';
            ctx.strokeStyle = highlightCol;
          } else {
            // console.log("not lighting")
            ctx.lineCap = 'round';
            ctx.strokeStyle = col;
          }
          ctx.lineWidth = pixels[i].strokeWidth || 1;
          // pixels[i].highlighting ? console.log("HIIII") : console.log("LOOOO");
          // console.log(state.color[user])
          if (pixels[i].dragging && i) { //if we're in dragging mode, use the last pixel
            ctx.moveTo(pixels[i - 1].x * w, pixels[i - 1].y * h);
          } else { //else use the current pixel, offset by 1px to the left
            ctx.moveTo(pixels[i].x * w, pixels[i].y * h - 1);
          }
          ctx.lineTo(pixels[i].x * w, pixels[i].y * h);//draw a line from point mentioned above to the current pixel
          // ctx.save();
          // ctx.fillRect(pixels[i].x * w, pixels[i].y * h, 10, 10); // fill in the pixel at (10,10)

          ctx.stroke();//draw the line
          ctx.closePath();//end the line
        }
      }
      state.finishedSaving[action.payload.page] = ctx.canvas.toDataURL();
      return { ...state, ctx: ctx };
    }
    case ADD_USER: {
      return {
        ...state,
        color: {
          ...state.color,
          [action.payload.user]: action.payload.color
        },
      };
    }
    default:
      throw new Error();
  }
}



export {
  ADD_USER,
  SET_INITIAL_PIXELS,
  SET_PIXEL,
  SET_CTX,
  REDRAW,
  SET_POINTER,
  SAVE
}
