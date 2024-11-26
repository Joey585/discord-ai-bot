def process_text(string):
    current_conversation = []
    lines = string.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if i + 1 < len(lines) and lines[i + 1].strip().startswith("- [replyingTo|"):
            metadata = lines[i + 1].strip().strip("- ").replace("[", "(").replace("]", "").replace("replyingTo",
                                                                                                   "Replying to").replace(
                "|", " ") + ")"
            line += f" {metadata}"
            i += 1
        line = line.replace("[", "").replace("]", "")
        current_conversation.append(line)
        i += 1
    return current_conversation