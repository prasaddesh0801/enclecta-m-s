import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string | null;
    const taskId = formData.get('taskId') as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      // ignore
    }
    
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    const attachment = await prisma.fileAttachment.create({
      data: {
        url: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        clientId: clientId && clientId !== 'null' ? clientId : null,
        taskId: taskId && taskId !== 'null' ? taskId : null,
        uploadedById: session.user.id
      }
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
