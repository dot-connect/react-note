/// <reference  path="../typings/index.d.ts"/>
  

declare module "material-ui/utils/propTypes" {
  export namespace propTypes {
        type horizontal = 'left' | 'middle' | 'right';
        type vertical = 'top' | 'center' | 'bottom';
        type direction = 'left' | 'right' | 'up' | 'down';
        
        interface origin {
            horizontal: horizontal;
            vertical: vertical;
        }

        type corners = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
        type cornersAndCenter = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';
    }
}