import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";


/* =========================================================
   HERO UPLOAD
========================================================= */

const heroUploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "hero"
);

if (!fs.existsSync(heroUploadDirectory)) {
  fs.mkdirSync(
    heroUploadDirectory,
    {
      recursive: true,
    }
  );
}

const heroStorage = multer.diskStorage({
  destination: (
    req,
    file,
    cb
  ) => {
    cb(
      null,
      heroUploadDirectory
    );
  },

  filename: (
    req,
    file,
    cb
  ) => {
    const extension =
      path.extname(
        file.originalname
      );

    const uniqueName =
      `hero-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(
      null,
      uniqueName
    );
  },
});

function heroFileFilter(
  req,
  file,
  cb
) {
  const allowedMimeTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];

  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only MP4, WebM and MOV video files are allowed"
      ),
      false
    );
  }
}

export const uploadHeroVideo =
  multer({
    storage: heroStorage,

    fileFilter:
      heroFileFilter,

    limits: {
      fileSize:
        100 * 1024 * 1024,
    },
  });


/* =========================================================
   PRODUCT IMAGE UPLOAD
========================================================= */

const productUploadDirectory =
  path.join(
    process.cwd(),
    "uploads",
    "products"
  );

if (
  !fs.existsSync(
    productUploadDirectory
  )
) {
  fs.mkdirSync(
    productUploadDirectory,
    {
      recursive: true,
    }
  );
}

const productStorage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        productUploadDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const uniqueName =
        `product-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      cb(
        null,
        uniqueName
      );
    },
  });

function productFileFilter(
  req,
  file,
  cb
) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, WebP and AVIF image files are allowed"
      ),
      false
    );
  }
}

export const uploadProductImage =
  multer({
    storage:
      productStorage,

    fileFilter:
      productFileFilter,

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },
  });


/* =========================================================
   INSTAGRAM MEDIA UPLOAD
========================================================= */

const instagramUploadDirectory =
  path.join(
    process.cwd(),
    "uploads",
    "instagram"
  );

if (
  !fs.existsSync(
    instagramUploadDirectory
  )
) {
  fs.mkdirSync(
    instagramUploadDirectory,
    {
      recursive: true,
    }
  );
}

const instagramStorage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        instagramUploadDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const uniqueName =
        `instagram-${Date.now()}-${crypto.randomUUID()}${extension}`;

      cb(
        null,
        uniqueName
      );
    },
  });

function instagramFileFilter(
  req,
  file,
  cb
) {
  const allowedImages = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  const allowedVideos = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];

  if (
    allowedImages.includes(
      file.mimetype
    ) ||
    allowedVideos.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only JPG, PNG, WebP, AVIF, MP4, WebM and MOV files are allowed"
    ),
    false
  );
}

export const uploadInstagramMedia =
  multer({
    storage:
      instagramStorage,

    fileFilter:
      instagramFileFilter,

    limits: {
      fileSize:
        100 * 1024 * 1024,
    },
  });


  
/* =========================================================
   COLLECTION BANNER IMAGE UPLOAD
========================================================= */

const collectionUploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "collections"
);

if (!fs.existsSync(collectionUploadDirectory)) {
  fs.mkdirSync(collectionUploadDirectory, {
    recursive: true,
  });
}

const collectionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, collectionUploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(
      null,
      `collection-${Date.now()}-${crypto.randomUUID()}${extension}`
    );
  },
});

function collectionFileFilter(req, file, cb) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPG, PNG, WebP and AVIF image files are allowed"
    ),
    false
  );
}

export const uploadCollectionBanner = multer({
  storage: collectionStorage,
  fileFilter: collectionFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
