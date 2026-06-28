import re

with open('src/services/master-produk/media.service.ts', 'r') as f:
    content = f.read()

imports = """import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types\""""

content = re.sub(r'import type \{ ApiResponse \} from "@/types/api\.types"', imports, content)

upload_func = """  upload: async (file: File): Promise<UploadedMedia> => {
    const form = new FormData()
    form.append("file", file)

    const res = await fetchClient<ApiResponse<RawMedia>>("/media/upload", {
      method: "POST",
      data: form,
    })

    return { uuid: res.data.uuid, url: res.data.url }
  },"""

content = re.sub(r'  upload: async \(file: File\): Promise<UploadedMedia> => \{.*  \},', upload_func, content, flags=re.DOTALL)

with open('src/services/master-produk/media.service.ts', 'w') as f:
    f.write(content)
