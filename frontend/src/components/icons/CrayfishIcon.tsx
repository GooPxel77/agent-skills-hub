import React from "react";

export function CrayfishIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* 龙虾头/身体曲线 */}
            <path d="M12 4C9 4 7 8 7 13c0 3 1.5 6 3 8 1 1 3 1 4 0 1.5-2 3-5 3-8 0-5-2-9-5-9z" />
            {/* 眼睛 */}
            <circle cx="10" cy="7" r="1" fill="currentColor" stroke="none" />
            <circle cx="14" cy="7" r="1" fill="currentColor" stroke="none" />
            {/* 触角 */}
            <path d="M10 4c-1-2-3-3-5-2" />
            <path d="M14 4c1-2 3-3 5-2" />
            {/* 钳子 (左) */}
            <path d="M7 10C5 10 3 8 3 6c0-1 1-2 2-2 1 0 2 1 2 2" />
            <path d="M4 6c0 1.5 1 2.5 2 2.5" />
            {/* 钳子 (右) */}
            <path d="M17 10c2 0 4-2 4-4 0-1-1-2-2-2-1 0-2 1-2 2" />
            <path d="M20 6c0 1.5-1 2.5-2 2.5" />
            {/* 腿 */}
            <path d="M7 14H4" />
            <path d="M7 16H4" />
            <path d="M7 18H5" />
            <path d="M17 14h3" />
            <path d="M17 16h3" />
            <path d="M17 18h2" />
            {/* 尾巴纹理 */}
            <path d="M9 16h6" />
            <path d="M9.5 18h5" />
        </svg>
    );
}
