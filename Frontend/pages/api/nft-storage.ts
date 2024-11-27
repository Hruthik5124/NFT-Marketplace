import formidable from "formidable";
import { writeFileSync, unlinkSync, existsSync, mkdirSync, renameSync } from "fs";
import { NextApiHandler } from "next";
import path from "path";
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
require('dotenv').config();

const uploadDir = path.join(process.cwd(), "tmp");

// Ensure the tmp directory exists
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(403).json({ error: `Unsupported method ${req.method}` });
  }
  try {
    // Parse req body and save image in the project's tmp folder
    const { fields, files }: any = await new Promise((resolve, reject) => {
      const form = formidable({ multiples: true, uploadDir });
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Form parse error:", err);
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    const NFTName: string = fields.name.toString();
    const NFTDescription = fields.description.toString();
    console.log("Parsed data:", { fields, files });

    if (!files.image) {
      throw new Error("No image found in data");
    }

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    const { filepath, originalFilename = "image", mimetype = "image" } = imageFile;

    const nftName = NFTName.replace(/\s+/g, '_'); // Replace spaces with underscores
    const imageFileExtension = path.extname(originalFilename); // Extract the file extension
    const newImageFileName = `${nftName}${imageFileExtension}`;
    const newImageFilePath = path.join(path.dirname(filepath), newImageFileName);

    // Rename the uploaded image file to match the NFT name
    renameSync(filepath, newImageFilePath);

    console.log("Filepath:", newImageFilePath);
    const absoluteFilePath = path.resolve(newImageFilePath);
    console.log("Absolute file path:", absoluteFilePath);

    // Ensure the file exists
    if (!existsSync(absoluteFilePath)) {
      throw new Error(`File does not exist at path: ${absoluteFilePath}`);
    }

    // Step 1: Upload the image to IPFS
    let imageUrl: string;
    try {
      let formData = new FormData();
      formData.append('file', fs.createReadStream(absoluteFilePath));

      const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders(),
        }
      });

      console.log(pinataResponse.data);
      const imageHash = pinataResponse.data.IpfsHash;
      imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
      console.log(`Image URL: ${imageUrl}`);
    } catch (error) {
      console.log(error);
      throw new Error('Error uploading image to IPFS');
    }

    // Step 2: Create the JSON metadata file content with the image URL
    const jsonData = {
      name: NFTName,
      description: NFTDescription,
      image: imageUrl,
    };

    // Step 3: Save JSON file to the temp directory
    const jsonFileName = `${nftName}.json`;
    const jsonFilePath = path.join(uploadDir, jsonFileName);
    writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

    // Step 4: Upload JSON file to Pinata
    let jsonHash: string;
    try {
      let formData = new FormData();
      formData.append('file', fs.createReadStream(jsonFilePath));
      formData.append('pinataOptions', '{"cidVersion": 0}');
      const metadata = JSON.stringify({
        name: NFTName,
        keyvalues: {
          description: NFTDescription
        }
      });
      formData.append('pinataMetadata', metadata);

      const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders(),
        }
      });

      console.log(pinataResponse.data);
      jsonHash = pinataResponse.data.IpfsHash;
      console.log(`View the JSON file here: https://gateway.pinata.cloud/ipfs/${jsonHash}`);
    } catch (error) {
      console.log(error);
      throw new Error('Error uploading JSON to IPFS');
    }

    // Step 5: Delete temp image and JSON files
    unlinkSync(absoluteFilePath);
    unlinkSync(jsonFilePath);

    // Return tokenURI
    res.status(201).json({ uri: `https://gateway.pinata.cloud/ipfs/${jsonHash}` });
  } catch (e: any) {
    console.error("Error:", e);
    return res.status(400).json({ error: e.message });
  }
};

// Must disable bodyParser for formidable to work
export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
