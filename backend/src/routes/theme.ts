import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as themeController from '../controllers/themeController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure Multer for Brand Assets
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/brand';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.ico'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

// PUBLIC
router.get('/config', themeController.getThemeConfig);

// ADMIN ONLY
router.use(authenticate);
router.use(authorize(['System Admin']));

router.get('/presets', themeController.getPresets);
router.post('/presets/apply/:presetName', themeController.applyPreset);
router.post('/presets', themeController.savePreset);
router.delete('/presets/:id', themeController.deletePreset);

router.post('/logo/upload', upload.single('file'), themeController.uploadLogo);

export default router;
