export const classificationModels = [
  { id: 'efficientnetb0', label: 'EfficientNetB0' },
  { id: 'vit', label: 'ViT' },
  { id: 'deit', label: 'DeiT' },
  { id: 'swin', label: 'Swin Transformer' },
];

export const segmentationMethods = [
  { id: 'none', label: 'None' },
  { id: 'otsu', label: 'Otsu' },
  { id: 'gradcam', label: 'Grad-CAM' },
  { id: 'unet', label: 'U-Net' },
  { id: 'segnet', label: 'SegNet' },
  { id: 'deeplabv3plus', label: 'DeepLabV3+' },
];

export const xaiMethods = [
  { id: 'attention_rollout', label: 'Attention Rollout' },
  { id: 'transformer_attribution', label: 'Transformer Attribution' },
  { id: 'integrated_gradients', label: 'Integrated Gradients' },
  { id: 'occlusion_sensitivity', label: 'Occlusion Sensitivity' },
  { id: 'gradcam', label: 'Grad-CAM (XAI)' },
  { id: 'transition_attention_maps', label: 'Transition Attention Maps' },
  { id: 'swin_transformer_attribution', label: 'Swin CAM' },
];

export const modelLabel = (id) => classificationModels.find((model) => model.id === id)?.label || id;
export const segmentationLabel = (id) => segmentationMethods.find((method) => method.id === id)?.label || id;
export const xaiLabel = (id) => xaiMethods.find((method) => method.id === id)?.label || id;

export const imageSource = (value) => {
  if (!value) return null;
  if (value.startsWith('data:') || value.startsWith('blob:') || value.startsWith('http')) return value;
  return `data:image/png;base64,${value}`;
};
