import { Component } from '../base/Component';
import { overlayClasses } from '../../utils/classes';

type IconPath = Record<string, string>;

export class Header extends Component<void> {
  private static readonly _iconNamespace = 'http://www.w3.org/2000/svg';

  render(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add(overlayClasses.stack, overlayClasses.stackDense, overlayClasses.header);

    const titleRow = document.createElement('div');
    titleRow.classList.add(overlayClasses.headerTitleRow);

    const title = document.createElement('strong');
    title.textContent = 'textmode.export.js';
    title.classList.add(overlayClasses.title);

    const links = document.createElement('div');
    links.classList.add(overlayClasses.headerLinks);

    const githubLink = this._createLink(
      'https://github.com/humanbydefinition/textmode.export.js',
      'View repository on GitHub',
      overlayClasses.linkIcon,
      [
        { d: 'M0 0h24v24H0z', fill: 'none', stroke: 'none' },
        { d: 'M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5' },
      ],
    );

    const supportLink = this._createLink(
      'https://code.textmode.art/support.html',
      'Support textmode.export.js',
      overlayClasses.supportIcon,
      [
        { d: 'M0 0h24v24H0z', fill: 'none', stroke: 'none' },
        { d: 'M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1' },
        { d: 'M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2' },
        { d: 'M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2' },
        { d: 'M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5z' },
        { d: 'M16.746 16.726a3 3 0 1 0 .252 -5.555' },
      ],
    );

    links.appendChild(githubLink);
    links.appendChild(supportLink);

    titleRow.appendChild(title);
    titleRow.appendChild(links);

    const divider = document.createElement('div');
    divider.classList.add(overlayClasses.divider);

    container.appendChild(titleRow);
    container.appendChild(divider);
    return container;
  }

  private _createLink(href: string, ariaLabel: string, iconClass: string, paths: IconPath[]): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.classList.add(overlayClasses.supportLink);
    link.setAttribute('aria-label', ariaLabel);
    link.appendChild(this._createIcon(iconClass, paths));
    return link;
  }

  private _createIcon(className: string, paths: IconPath[]): SVGSVGElement {
    const svg = document.createElementNS(Header._iconNamespace, 'svg') as SVGSVGElement;
    svg.setAttribute('xmlns', Header._iconNamespace);
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.classList.add(className);

    for (const attributes of paths) {
      const path = document.createElementNS(Header._iconNamespace, 'path');
      for (const [attribute, value] of Object.entries(attributes)) {
        path.setAttribute(attribute, value);
      }
      svg.appendChild(path);
    }

    return svg;
  }
}
