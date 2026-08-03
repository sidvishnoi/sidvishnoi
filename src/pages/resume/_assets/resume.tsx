import type { ComponentChildren } from 'preact';
import { IconEmail, IconGitHub, IconLinkedIn, IconPdf } from './icons';

export const Header = ({
	title,
	children,
}: {
	title: string;
	children: ComponentChildren;
}) => (
	<header className="header">
		<h1>
			<span>Sid</span> <span>Vishnoi</span>
		</h1>
		<p className="tagline">{title}</p>
		<p class="summary">{children}</p>
		<a
			rel="alternate"
			type="application/pdf"
			href="/resume/sudhanshu-vishnoi-resume.pdf"
			className="with-icon noprint"
			title="Download Resume as PDF"
		>
			<IconPdf />
			PDF version
		</a>

		<Contact />
	</header>
);

export const References = () => (
	<section className="references">
		<h2>References</h2>

		<ul>
			<li>
				Marcos Cáceres (WebKit Standards and Interop){' '}
				<a href="mailto:marcosc@apple.com">marcosc@apple.com</a>
			</li>
		</ul>
	</section>
);

export const Education = () => (
	<section className="education">
		<h2>Education</h2>

		<article>
			<h3>Masters in Computer Applications</h3>
			<p>University of Delhi</p>
			<time datetime="156w">2016 &ndash; 2019</time>
		</article>

		<article>
			<h3>B.Sc. Physics (H)</h3>
			<p>University of Delhi</p>
			<time datetime="156w">2013 &ndash; 2016</time>
		</article>
	</section>
);

export const Contact = () => (
	<div className="contact">
		<div>
			<IconEmail />
			<span className="visually-hidden">Email:</span>
			<a href="mailto:hire@sidvishnoi.com">hire@sidvishnoi.com</a>
		</div>

		<div>
			<IconGitHub />
			<span className="visually-hidden">GitHub:</span>
			<a href="https://www.github.com/sidvishnoi">github.com/sidvishnoi</a>
		</div>

		<div>
			<IconLinkedIn />
			<span className="visually-hidden">LinkedIn:</span>
			<a href="https://www.linkedin.com/in/sudhanshu-vishnoi/">
				linkedin.com/in/sudhanshu-vishnoi
			</a>
		</div>
	</div>
);

interface ExperienceItemProps {
	title: string;
	time: string;
	duration: [start: string, end: string];
	children: ComponentChildren;
}
export const ExperienceItem = ({
	title,
	time,
	duration,
	children,
}: ExperienceItemProps) => (
	<article>
		<header>
			<h3>{title}</h3>
			<time datetime={time}>
				{duration[0]} – {duration[1]}
			</time>
		</header>
		<p>{children}</p>
	</article>
);
