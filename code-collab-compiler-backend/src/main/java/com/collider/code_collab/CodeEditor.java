package com.collider.code_collab;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CodeEditor {
    private String userId;
    private String roomId;
    private String content;
}
