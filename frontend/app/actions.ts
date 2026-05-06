"use server";

import { revalidatePath } from "next/cache";

export async function revalidateSite(path: string = "/", type: "page" | "layout" = "layout") {
  revalidatePath(path, type);
}
